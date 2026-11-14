from sqlalchemy.orm import Session
from app.models.service import Service
from app.models.slo import SLOConfig, MetricObservation
from datetime import datetime, timedelta, timezone
from typing import Dict


def calculate_slo(db: Session, service: Service, config: SLOConfig) -> Dict:
    since = datetime.now(timezone.utc) - timedelta(days=config.window_days)
    observations = (
        db.query(MetricObservation)
        .filter(
            MetricObservation.service_id == service.id,
            MetricObservation.timestamp >= since,
        )
        .all()
    )

    if not observations:
        availability = service.uptime_percent
        p95 = service.avg_latency_ms
        error_rate = 0.0
    else:
        total = len(observations)
        healthy = sum(1 for o in observations if o.is_healthy)
        availability = (healthy / total * 100) if total > 0 else 100.0

        latencies = sorted([o.p95_latency_ms for o in observations if o.p95_latency_ms > 0])
        p95 = latencies[int(len(latencies) * 0.95)] if latencies else service.avg_latency_ms

        total_requests = sum(o.request_count for o in observations) or 1
        total_errors = sum(o.error_count for o in observations)
        error_rate = total_errors / total_requests * 100

    allowed_downtime = 100 - config.availability_target
    actual_downtime = 100 - availability
    budget_consumed = (actual_downtime / allowed_downtime * 100) if allowed_downtime > 0 else 100.0
    budget_remaining = max(0.0, 100.0 - budget_consumed)

    is_meeting = (
        availability >= config.availability_target
        and p95 <= config.latency_p95_target_ms
        and error_rate <= config.error_rate_target
    )

    return {
        "service_id": service.id,
        "service_name": service.name,
        "slug": service.slug,
        "availability_target": config.availability_target,
        "availability_actual": round(availability, 3),
        "latency_target_ms": config.latency_p95_target_ms,
        "latency_actual_ms": round(p95, 2),
        "latency_p95_target_ms": config.latency_p95_target_ms,
        "latency_p95_actual_ms": round(p95, 2),
        "error_rate_target": config.error_rate_target,
        "error_rate_actual": round(error_rate, 3),
        "error_budget_remaining": round(budget_remaining, 2),
        "error_budget_pct_remaining": round(budget_remaining, 2),
        "is_meeting_slo": is_meeting,
        "window_days": config.window_days,
    }
