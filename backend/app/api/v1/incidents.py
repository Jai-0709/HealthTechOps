from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.incident import Incident, IncidentEvent
from app.schemas.incident import IncidentCreate, IncidentUpdate
from app.services.audit_logger import log_action
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.get("")
def list_incidents(
    status: str = None,
    severity: str = None,
    service_id: str = None,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Incident)
    if status:
        q = q.filter(Incident.status == status)
    if severity:
        q = q.filter(Incident.severity == severity)
    if service_id:
        q = q.filter(Incident.service_id == service_id)
    incidents = q.order_by(Incident.detected_at.desc()).limit(limit).all()
    return [
        {
            "id": i.id,
            "title": i.title,
            "severity": i.severity,
            "status": i.status,
            "service_id": i.service_id,
            "service_name": i.service.name if i.service else None,
            "detected_at": i.detected_at.isoformat(),
            "resolved_at": i.resolved_at.isoformat() if i.resolved_at else None,
        }
        for i in incidents
    ]


@router.post("")
def create_incident(
    body: IncidentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role == "VIEWER":
        raise HTTPException(403, "Viewers cannot create incidents")
    inc = Incident(
        id=str(uuid.uuid4()),
        title=body.title,
        description=body.description,
        severity=body.severity,
        service_id=body.service_id,
        status="OPEN",
        detected_at=datetime.now(timezone.utc),
    )
    db.add(inc)
    db.flush()
    db.add(IncidentEvent(
        incident_id=inc.id,
        event_type="CREATED",
        description=f"Manually created by {current_user.email}",
        actor_id=current_user.id,
    ))
    db.commit()
    log_action(db, "CREATE_INCIDENT", current_user.email, current_user.role, "incident", inc.id)
    return {"id": inc.id, "title": inc.title}


@router.get("/{incident_id}")
def get_incident(incident_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    i = db.query(Incident).filter(Incident.id == incident_id).first()
    if not i:
        raise HTTPException(404, "Incident not found")
    events = (
        db.query(IncidentEvent)
        .filter(IncidentEvent.incident_id == incident_id)
        .order_by(IncidentEvent.occurred_at)
        .all()
    )
    return {
        "id": i.id,
        "title": i.title,
        "description": i.description,
        "severity": i.severity,
        "status": i.status,
        "service_id": i.service_id,
        "service_name": i.service.name if i.service else None,
        "detected_at": i.detected_at.isoformat(),
        "resolved_at": i.resolved_at.isoformat() if i.resolved_at else None,
        "root_cause_notes": i.root_cause_notes,
        "evidence": i.evidence,
        "events": [
            {
                "id": e.id,
                "event_type": e.event_type,
                "description": e.description,
                "occurred_at": e.occurred_at.isoformat(),
            }
            for e in events
        ],
    }


@router.patch("/{incident_id}")
def update_incident(
    incident_id: str,
    body: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    i = db.query(Incident).filter(Incident.id == incident_id).first()
    if not i:
        raise HTTPException(404, "Incident not found")
    if current_user.role == "VIEWER":
        raise HTTPException(403, "Viewers cannot update incidents")

    if body.status:
        old = i.status
        i.status = body.status
        if body.status == "RESOLVED" and not i.resolved_at:
            i.resolved_at = datetime.now(timezone.utc)
        db.add(IncidentEvent(
            incident_id=i.id,
            event_type="STATUS_CHANGE",
            description=f"Status changed {old} → {body.status} by {current_user.email}",
            actor_id=current_user.id,
        ))
    if body.severity:
        i.severity = body.severity
    if body.root_cause_notes is not None:
        i.root_cause_notes = body.root_cause_notes
    if body.assigned_to is not None:
        i.assigned_to = body.assigned_to

    db.commit()
    log_action(db, "UPDATE_INCIDENT", current_user.email, current_user.role, "incident", incident_id)
    return {"id": i.id, "status": i.status}
