from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.service import Service
from app.models.slo import MetricObservation
from app.schemas.service import ServiceResponse
from datetime import datetime, timedelta, timezone
import httpx

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=list[ServiceResponse])
def list_services(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Service).all()


@router.get("/{slug}")
def get_service(slug: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    svc = db.query(Service).filter(Service.slug == slug).first()
    if not svc:
        raise HTTPException(404, "Service not found")

    since = datetime.now(timezone.utc) - timedelta(hours=2)
    obs = (
        db.query(MetricObservation)
        .filter(MetricObservation.service_id == svc.id, MetricObservation.timestamp >= since)
        .order_by(MetricObservation.timestamp.desc())
        .limit(60)
        .all()
    )

    return {
        "id": svc.id,
        "name": svc.name,
        "slug": svc.slug,
        "description": svc.description,
        "status": svc.status,
        "cpu_percent": svc.cpu_percent,
        "memory_percent": svc.memory_percent,
        "request_count": svc.request_count,
        "error_count": svc.error_count,
        "avg_latency_ms": svc.avg_latency_ms,
        "uptime_percent": svc.uptime_percent,
        "last_checked": svc.last_checked.isoformat() if svc.last_checked else None,
        "port": svc.port,
        "metrics_history": [
            {
                "timestamp": o.timestamp.isoformat(),
                "cpu": o.cpu_percent,
                "memory": o.memory_percent,
                "latency": o.p95_latency_ms,
                "errors": o.error_count,
            }
            for o in reversed(obs)
        ],
    }


@router.post("/{slug}/inject-failure")
def inject_failure(
    slug: str,
    body: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role == "VIEWER":
        raise HTTPException(403, "Viewers cannot inject failures")
    svc = db.query(Service).filter(Service.slug == slug).first()
    if not svc:
        raise HTTPException(404, "Service not found")
    if not svc.port:
        raise HTTPException(400, "Service has no port configured")
    try:
        resp = httpx.post(f"http://localhost:{svc.port}/inject-failure", json=body, timeout=10.0)
        return resp.json()
    except Exception as e:
        raise HTTPException(503, f"Could not reach synthetic service: {e}")


@router.get("/{slug}/logs")
def get_service_logs(slug: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    svc = db.query(Service).filter(Service.slug == slug).first()
    if not svc:
        raise HTTPException(404, "Service not found")
    if svc.port:
        try:
            resp = httpx.get(f"http://localhost:{svc.port}/logs", timeout=5.0)
            return resp.json()
        except Exception:
            pass
    return {"logs": [], "message": "Service simulator not running. Start synthetic-services/simulator.py"}
