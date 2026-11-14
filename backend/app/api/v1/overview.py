from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.service import Service
from app.models.incident import Incident

router = APIRouter(prefix="/overview", tags=["overview"])


@router.get("")
def get_overview(db: Session = Depends(get_db), _=Depends(get_current_user)):
    services = db.query(Service).all()
    total = len(services)
    healthy = sum(1 for s in services if s.status == "HEALTHY")
    degraded = sum(1 for s in services if s.status == "DEGRADED")
    down = sum(1 for s in services if s.status == "DOWN")

    open_incidents = db.query(Incident).filter(
        Incident.status.in_(["OPEN", "INVESTIGATING", "ACKNOWLEDGED"])
    ).count()
    critical = db.query(Incident).filter(
        Incident.status.in_(["OPEN", "INVESTIGATING"]),
        Incident.severity == "CRITICAL",
    ).count()

    recent = db.query(Incident).order_by(Incident.detected_at.desc()).limit(5).all()

    health = "HEALTHY" if down == 0 and degraded == 0 else ("DEGRADED" if down == 0 else "DOWN")

    return {
        "services": {"total": total, "healthy": healthy, "degraded": degraded, "down": down},
        "incidents": {"open": open_incidents, "critical": critical},
        "system_health": health,
        "recent_incidents": [
            {
                "id": i.id,
                "title": i.title,
                "severity": i.severity,
                "status": i.status,
                "detected_at": i.detected_at.isoformat(),
                "service_id": i.service_id,
                "service_name": i.service.name if i.service else None,
            }
            for i in recent
        ],
    }
