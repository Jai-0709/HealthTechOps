"""
Incident detector: polls synthetic services every 30s and auto-creates/resolves incidents.
"""
import threading
import time
import hashlib
import uuid
import logging
from datetime import datetime, timezone
from app.core.config import settings

logger = logging.getLogger(__name__)

_running = False
_thread = None


def _make_dedup_hash(service_id: str, issue: str) -> str:
    return hashlib.md5(f"{service_id}:{issue}".encode()).hexdigest()


def _check_services():
    import httpx
    from app.core.database import SessionLocal
    from app.models.service import Service
    from app.models.incident import Incident, IncidentEvent
    from app.models.slo import MetricObservation

    db = SessionLocal()
    try:
        services = db.query(Service).all()
        for svc in services:
            if not svc.port:
                continue
            try:
                resp = httpx.get(f"http://{settings.SIMULATOR_HOST}:{svc.port}/health", timeout=5.0)
                data = resp.json()
                raw_status = data.get("status", "unknown")

                svc.last_checked = datetime.now(timezone.utc)
                svc.cpu_percent = float(data.get("cpu_percent", svc.cpu_percent))
                svc.memory_percent = float(data.get("memory_percent", svc.memory_percent))
                svc.avg_latency_ms = float(data.get("avg_latency_ms", svc.avg_latency_ms))
                svc.error_count = int(data.get("error_count", svc.error_count))
                svc.request_count = int(data.get("request_count", svc.request_count))

                old_status = svc.status
                new_status = (
                    "HEALTHY" if raw_status == "healthy"
                    else "DOWN" if raw_status == "down"
                    else "DEGRADED"
                )
                svc.status = new_status

                # Record live MetricObservation
                obs = MetricObservation(
                    service_id=svc.id,
                    timestamp=datetime.now(timezone.utc),
                    cpu_percent=svc.cpu_percent,
                    memory_percent=svc.memory_percent,
                    request_count=svc.request_count,
                    error_count=svc.error_count,
                    avg_latency_ms=svc.avg_latency_ms,
                    p95_latency_ms=round(svc.avg_latency_ms * 1.3, 2),
                    is_healthy=(new_status == "HEALTHY"),
                )
                db.add(obs)

                # Create incident if newly degraded/down
                if old_status in ("HEALTHY", "UNKNOWN") and new_status in ("DEGRADED", "DOWN"):
                    severity = "CRITICAL" if new_status == "DOWN" else "HIGH"
                    issue = "service_down" if new_status == "DOWN" else "service_degraded"
                    dedup = _make_dedup_hash(svc.id, issue)
                    existing = db.query(Incident).filter(
                        Incident.dedup_hash == dedup,
                        Incident.status.in_(["OPEN", "INVESTIGATING", "ACKNOWLEDGED"]),
                    ).first()
                    if not existing:
                        inc = Incident(
                            id=str(uuid.uuid4()),
                            title=f"{svc.name} is {new_status.lower()}",
                            description=(
                                f"Automated detection: {svc.name} returned status '{raw_status}'. "
                                f"CPU: {svc.cpu_percent:.1f}%, Memory: {svc.memory_percent:.1f}%"
                            ),
                            severity=severity,
                            status="OPEN",
                            service_id=svc.id,
                            dedup_hash=dedup,
                            detected_at=datetime.now(timezone.utc),
                            evidence={
                                "cpu": svc.cpu_percent,
                                "memory": svc.memory_percent,
                                "latency": svc.avg_latency_ms,
                                "raw_status": raw_status,
                            },
                        )
                        db.add(inc)
                        db.flush()
                        db.add(IncidentEvent(
                            incident_id=inc.id,
                            event_type="DETECTED",
                            description="Incident detected automatically by monitoring agent",
                            occurred_at=datetime.now(timezone.utc),
                        ))
                        logger.info(f"Created incident: {inc.title}")

                # Auto-resolve if recovered
                elif old_status in ("DEGRADED", "DOWN") and new_status == "HEALTHY":
                    for issue in ("service_down", "service_degraded"):
                        dedup = _make_dedup_hash(svc.id, issue)
                        open_inc = db.query(Incident).filter(
                            Incident.dedup_hash == dedup,
                            Incident.status.in_(["OPEN", "INVESTIGATING"]),
                        ).first()
                        if open_inc:
                            open_inc.status = "RESOLVED"
                            open_inc.resolved_at = datetime.now(timezone.utc)
                            db.add(IncidentEvent(
                                incident_id=open_inc.id,
                                event_type="RESOLVED",
                                description="Service health restored; incident resolved automatically",
                                occurred_at=datetime.now(timezone.utc),
                            ))
                            logger.info(f"Auto-resolved incident: {open_inc.title}")

                db.commit()

            except Exception as e:
                logger.debug(f"Cannot reach {svc.name} on port {svc.port}: {e}")
                if svc.status != "DOWN":
                    svc.status = "DOWN"
                    svc.last_checked = datetime.now(timezone.utc)
                    dedup = _make_dedup_hash(svc.id, "service_down")
                    existing = db.query(Incident).filter(
                        Incident.dedup_hash == dedup,
                        Incident.status.in_(["OPEN", "INVESTIGATING", "ACKNOWLEDGED"]),
                    ).first()
                    if not existing:
                        inc = Incident(
                            id=str(uuid.uuid4()),
                            title=f"{svc.name} is down (unreachable)",
                            description=f"Automated detection: Cannot reach {svc.name} on port {svc.port}. Service is unresponsive.",
                            severity="CRITICAL",
                            status="OPEN",
                            service_id=svc.id,
                            dedup_hash=dedup,
                            detected_at=datetime.now(timezone.utc),
                            evidence={"raw_status": "unreachable", "port": svc.port, "error": str(e)},
                        )
                        db.add(inc)
                        db.flush()
                        db.add(IncidentEvent(
                            incident_id=inc.id,
                            event_type="DETECTED",
                            description="Service unreachable; critical incident auto-created",
                            occurred_at=datetime.now(timezone.utc),
                        ))
                        logger.info(f"Created down incident: {inc.title}")
                    try:
                        db.commit()
                    except Exception:
                        db.rollback()
    except Exception as e:
        logger.error(f"Detector error: {e}")
        db.rollback()
    finally:
        db.close()


def _run():
    global _running
    logger.info("Incident detector started")
    while _running:
        try:
            _check_services()
        except Exception as e:
            logger.error(f"Detector loop error: {e}")
        time.sleep(settings.INCIDENT_DETECTION_INTERVAL_SECONDS)


def start_detector():
    global _thread, _running
    _running = True
    _thread = threading.Thread(target=_run, daemon=True, name="incident-detector")
    _thread.start()


def stop_detector():
    global _running
    _running = False
