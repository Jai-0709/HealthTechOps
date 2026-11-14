"""
Incident correlator: groups related incidents by service dependency chain.
"""
from sqlalchemy.orm import Session
from app.models.incident import Incident
from app.models.service import ServiceDependency


def correlate_incidents(db: Session, incident_id: str) -> list[str]:
    """Return IDs of incidents that may be related to the given incident."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident or not incident.service_id:
        return []

    # Find all services in the dependency chain
    related_service_ids = {incident.service_id}
    deps = db.query(ServiceDependency).filter(
        ServiceDependency.service_id == incident.service_id
    ).all()
    for dep in deps:
        related_service_ids.add(dep.depends_on_id)

    # Find recent open incidents for related services
    from datetime import datetime, timezone, timedelta
    cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
    related = db.query(Incident).filter(
        Incident.service_id.in_(related_service_ids),
        Incident.id != incident_id,
        Incident.detected_at >= cutoff,
        Incident.status.in_(["OPEN", "INVESTIGATING"])
    ).all()

    return [r.id for r in related]
