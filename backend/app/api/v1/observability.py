from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.slo import MetricObservation
from app.models.service import Service
from datetime import datetime, timedelta, timezone
import random

router = APIRouter(prefix="/observability", tags=["observability"])


@router.get("/metrics")
def get_metrics(
    hours: int = Query(1, ge=1, le=24),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    obs = (
        db.query(MetricObservation)
        .filter(MetricObservation.timestamp >= since)
        .order_by(MetricObservation.timestamp.desc())
        .limit(120)
        .all()
    )
    return {
        "service_metrics": [
            {
                "timestamp": o.timestamp.isoformat(),
                "service_id": o.service_id,
                "cpu": o.cpu_percent,
                "memory": o.memory_percent,
                "latency": o.p95_latency_ms,
                "errors": o.error_count,
            }
            for o in reversed(obs)
        ]
    }


@router.get("/logs")
def get_logs(
    service_id: str = None,
    level: str = None,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    services = db.query(Service).all()
    target = [s for s in services if not service_id or s.id == service_id] or services

    levels = ["INFO", "DEBUG", "WARN", "ERROR"]
    weights = [0.6, 0.2, 0.15, 0.05]
    messages = [
        "Request processed successfully in {latency}ms",
        "Database query completed in {db_ms}ms",
        "Cache hit ratio: {pct}%",
        "Health check passed",
        "Authentication token validated",
        "Connection pool: {active}/20 active",
        "Circuit breaker: CLOSED",
        "Scheduled job completed",
        "High latency detected: {latency}ms",
        "Memory pressure: {pct}%",
        "Retrying failed request (attempt {n})",
        "Error processing request: upstream timeout",
    ]

    logs = []
    now = datetime.now(timezone.utc)
    for i in range(min(limit, 100)):
        svc = random.choice(target) if target else None
        lvl = level if level else random.choices(levels, weights)[0]
        msg = random.choice(messages).format(
            latency=random.randint(10, 2000),
            db_ms=random.randint(5, 100),
            pct=random.randint(60, 95),
            active=random.randint(1, 20),
            n=random.randint(1, 3),
        )
        logs.append({
            "timestamp": (now - timedelta(seconds=i * 30 + random.randint(0, 29))).isoformat(),
            "level": lvl,
            "service": svc.name if svc else "system",
            "message": msg,
            "trace_id": f"trace-{random.randint(100000, 999999)}",
        })

    logs.sort(key=lambda x: x["timestamp"], reverse=True)
    return {"logs": logs}


@router.get("/traces")
def get_traces(_=Depends(get_current_user)):
    svc_names = ["claims-api", "provider-portal", "pharmacy-service", "identity-service"]
    traces = []
    now = datetime.now(timezone.utc)
    for i in range(20):
        root = random.choice(svc_names)
        total = random.randint(50, 2500)
        spans = [{"service": root, "operation": "HTTP GET /api/resource", "duration_ms": total, "status": "ok" if total < 1500 else "slow"}]
        if random.random() > 0.4:
            spans.append({"service": "identity-service", "operation": "validate_token", "duration_ms": random.randint(5, 50), "status": "ok"})
        if random.random() > 0.6:
            spans.append({"service": "database-service", "operation": "SELECT query", "duration_ms": random.randint(10, 300), "status": "ok"})
        traces.append({
            "trace_id": f"trace-{random.randint(100000, 999999)}",
            "timestamp": (now - timedelta(minutes=i * 3)).isoformat(),
            "root_service": root,
            "total_duration_ms": total,
            "span_count": len(spans),
            "status": "ok" if total < 1500 else "slow",
            "spans": spans,
        })
    return {"traces": traces}
