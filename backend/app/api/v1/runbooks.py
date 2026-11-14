from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.runbook import Runbook
from app.models.remediation import RemediationRequest
from app.services.audit_logger import log_action
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/runbooks", tags=["runbooks"])


@router.get("")
def list_runbooks(db: Session = Depends(get_db), _=Depends(get_current_user)):
    rbs = db.query(Runbook).all()
    return [
        {
            "id": r.id, "name": r.name, "slug": r.slug,
            "description": r.description, "risk_level": r.risk_level,
            "steps": r.steps, "is_allowlisted": r.is_allowlisted,
            "service_type": r.service_type,
            "created_at": r.created_at.isoformat(),
        }
        for r in rbs
    ]


@router.get("/{runbook_id}")
def get_runbook(runbook_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    rb = db.query(Runbook).filter(Runbook.id == runbook_id).first()
    if not rb:
        raise HTTPException(404, "Runbook not found")
    return {
        "id": rb.id, "name": rb.name, "slug": rb.slug,
        "description": rb.description, "risk_level": rb.risk_level,
        "steps": rb.steps, "is_allowlisted": rb.is_allowlisted,
        "service_type": rb.service_type,
        "created_at": rb.created_at.isoformat(),
    }


@router.post("/{runbook_id}/execute")
def request_execution(
    runbook_id: str,
    body: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role == "VIEWER":
        raise HTTPException(403, "Viewers cannot request remediation")
    rb = db.query(Runbook).filter(Runbook.id == runbook_id).first()
    if not rb:
        raise HTTPException(404, "Runbook not found")

    req = RemediationRequest(
        id=str(uuid.uuid4()),
        runbook_id=runbook_id,
        incident_id=body.get("incident_id"),
        action_name=rb.name,
        risk_level=rb.risk_level,
        affected_service_id=body.get("service_id"),
        status="PENDING",
        requested_by=current_user.id,
        requested_at=datetime.now(timezone.utc),
    )
    db.add(req)
    db.commit()
    log_action(db, "REQUEST_REMEDIATION", current_user.email, current_user.role, "remediation", req.id)
    return {"remediation_id": req.id, "status": "PENDING", "message": "Awaiting approval"}
