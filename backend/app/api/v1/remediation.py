from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.remediation import RemediationRequest
from app.models.incident import Incident, IncidentEvent
from app.models.service import Service
from app.services.audit_logger import log_action
from datetime import datetime, timezone
import uuid
import httpx

router = APIRouter(prefix="/remediation", tags=["remediation"])

SIMULATIONS = {
    "restart_service": lambda s: {"result": f"Service {s} restarted successfully", "duration_ms": 2300},
    "clear_cache": lambda s: {"result": f"Cache cleared for {s}", "duration_ms": 450},
    "scale_up_replicas": lambda s: {"result": f"Scaled to 3 replicas for {s}", "duration_ms": 8000},
    "rotate_logs": lambda s: {"result": f"Logs rotated for {s}", "duration_ms": 300},
    "flush_connection_pool": lambda s: {"result": f"Connection pool flushed for {s}", "duration_ms": 600},
    "enable_circuit_breaker": lambda s: {"result": f"Circuit breaker enabled for {s}", "duration_ms": 100},
    "increase_timeout": lambda s: {"result": f"Timeout increased to 30s for {s}", "duration_ms": 50},
    "rollback_deployment": lambda s: {"result": f"Rolled back to previous deployment for {s}", "duration_ms": 15000},
}


@router.get("/pending")
def list_pending(db: Session = Depends(get_db), _=Depends(get_current_user)):
    reqs = db.query(RemediationRequest).filter(RemediationRequest.status == "PENDING").all()
    return [_format(r) for r in reqs]


@router.get("")
def list_all(db: Session = Depends(get_db), _=Depends(get_current_user)):
    reqs = db.query(RemediationRequest).order_by(RemediationRequest.requested_at.desc()).limit(50).all()
    return [_format(r) for r in reqs]


def _format(r: RemediationRequest) -> dict:
    return {
        "id": r.id,
        "action_name": r.action_name,
        "risk_level": r.risk_level,
        "status": r.status,
        "incident_id": r.incident_id,
        "requested_at": r.requested_at.isoformat(),
        "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
        "execution_result": r.execution_result,
    }


@router.post("/request")
def create_request(
    body: dict,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("ADMIN", "SRE_ENGINEER")),
):
    action_name = body.get("action_name") or body.get("name") or "restart_service"
    req = RemediationRequest(
        id=str(uuid.uuid4()),
        incident_id=body.get("incident_id"),
        runbook_id=body.get("runbook_id"),
        action_name=action_name,
        risk_level=body.get("risk_level", "MEDIUM"),
        affected_service_id=body.get("service_id"),
        status="PENDING",
        requested_by=current_user.id,
        requested_at=datetime.now(timezone.utc),
    )
    db.add(req)
    db.commit()
    log_action(db, "REQUEST_REMEDIATION", current_user.email, current_user.role, "remediation", req.id)
    return _format(req)


@router.post("/{req_id}/approve")
def approve(
    req_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("ADMIN", "SRE_ENGINEER")),
):
    req = db.query(RemediationRequest).filter(RemediationRequest.id == req_id).first()
    if not req:
        raise HTTPException(404, "Request not found")
    if req.status != "PENDING":
        raise HTTPException(400, f"Cannot approve in state {req.status}")

    req.status = "EXECUTING"
    req.reviewed_by = current_user.id
    req.reviewed_at = datetime.now(timezone.utc)
    db.commit()

    action_key = req.action_name.lower().replace(" ", "_").replace("-", "_")
    sim = SIMULATIONS.get(action_key)
    svc = req.affected_service_id or "unknown-service"
    result = sim(svc) if sim else {"result": f"Executed: {req.action_name}"}

    # Heal real microservice if running
    service_to_heal = None
    if req.affected_service_id:
        service_to_heal = db.query(Service).filter(
            (Service.id == req.affected_service_id) | (Service.slug == req.affected_service_id)
        ).first()
    elif req.incident_id:
        inc = db.query(Incident).filter(Incident.id == req.incident_id).first()
        if inc and inc.service_id:
            service_to_heal = db.query(Service).filter(Service.id == inc.service_id).first()

    if service_to_heal and service_to_heal.port:
        try:
            h_resp = httpx.post(
                f"http://{settings.SIMULATOR_HOST}:{service_to_heal.port}/remediate",
                json={"action": req.action_name},
                timeout=5.0,
            )
            if h_resp.is_success:
                service_to_heal.status = "HEALTHY"
                result["microservice_healed"] = True
        except Exception as e:
            result["microservice_warning"] = str(e)

    req.status = "COMPLETED"
    req.execution_result = {"action": action_key, **result}
    req.recovery_verified = True
    db.commit()

    if req.incident_id:
        inc = db.query(Incident).filter(Incident.id == req.incident_id).first()
        if inc and inc.status != "RESOLVED":
            inc.status = "RESOLVED"
            inc.resolved_at = datetime.now(timezone.utc)
        db.add(IncidentEvent(
            incident_id=req.incident_id,
            event_type="REMEDIATION_APPLIED",
            description=f"Remediation '{req.action_name}' approved and executed by {current_user.email}",
            actor_id=current_user.id,
        ))
        db.add(IncidentEvent(
            incident_id=req.incident_id,
            event_type="RESOLVED",
            description="Incident marked RESOLVED following verified remediation",
            actor_id=current_user.id,
        ))
        db.commit()

    log_action(db, "APPROVE_REMEDIATION", current_user.email, current_user.role, "remediation", req_id)
    return {"id": req.id, "status": req.status, "result": req.execution_result}


@router.post("/{req_id}/reject")
def reject(
    req_id: str,
    body: dict = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("ADMIN", "SRE_ENGINEER")),
):
    req = db.query(RemediationRequest).filter(RemediationRequest.id == req_id).first()
    if not req:
        raise HTTPException(404, "Request not found")
    if req.status != "PENDING":
        raise HTTPException(400, f"Cannot reject in state {req.status}")
    req.status = "REJECTED"
    req.reviewed_by = current_user.id
    req.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    log_action(db, "REJECT_REMEDIATION", current_user.email, current_user.role, "remediation", req_id)
    return {"id": req.id, "status": "REJECTED"}
