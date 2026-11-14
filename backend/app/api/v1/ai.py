from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.incident import Incident
from app.models.ai_investigation import AIInvestigation
from app.models.service import Service
from app.services.ai_agent import investigate_incident
from app.services.audit_logger import log_action
from app.core.config import settings
from datetime import datetime, timezone
import uuid
import httpx

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/status")
def ai_status(_=Depends(get_current_user)):
    try:
        resp = httpx.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=10.0)
        resp.raise_for_status()
        models = [m["name"] for m in resp.json().get("models", [])]
        return {"available": True, "models": models, "base_url": settings.OLLAMA_BASE_URL, "configured_model": settings.OLLAMA_MODEL}
    except Exception as exc:
        import logging
        logging.getLogger(__name__).error(f"Ollama status check failed: {exc}")
        return {"available": False, "models": [], "base_url": settings.OLLAMA_BASE_URL, "configured_model": settings.OLLAMA_MODEL, "error": str(exc)}


@router.post("/investigate")
def start_investigation(
    body: dict,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    incident_id = body.get("incident_id")
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(404, "Incident not found")

    inv = AIInvestigation(
        id=str(uuid.uuid4()),
        incident_id=incident_id,
        status="RUNNING",
        started_at=datetime.now(timezone.utc),
    )
    db.add(inv)
    db.commit()
    inv_id = inv.id

    svc_name = "unknown"
    if incident.service_id:
        svc = db.query(Service).filter(Service.id == incident.service_id).first()
        if svc:
            svc_name = svc.name

    incident_data = {
        "title": incident.title,
        "description": incident.description or "",
        "service_name": svc_name,
        "severity": incident.severity,
        "evidence": incident.evidence or {},
    }

    log_action(db, "AI_INVESTIGATE", current_user.email, current_user.role, "incident", incident_id)

    def run_bg():
        from app.core.database import SessionLocal
        db2 = SessionLocal()
        try:
            result = investigate_incident(incident_data)
            inv2 = db2.query(AIInvestigation).filter(AIInvestigation.id == inv_id).first()
            if inv2:
                inv2.status = result["status"]
                inv2.root_cause_summary = result.get("root_cause_summary")
                inv2.evidence_items = result.get("evidence_items", [])
                inv2.recommended_actions = result.get("recommended_actions", [])
                inv2.confidence_score = result.get("confidence_score", 0.0)
                inv2.raw_response = result.get("raw_response")
                inv2.prompt_hash = result.get("prompt_hash")
                inv2.completed_at = datetime.now(timezone.utc)
                db2.commit()
        except Exception as e:
            inv2 = db2.query(AIInvestigation).filter(AIInvestigation.id == inv_id).first()
            if inv2:
                inv2.status = "FAILED"
                inv2.raw_response = str(e)
                inv2.completed_at = datetime.now(timezone.utc)
                db2.commit()
        finally:
            db2.close()

    background_tasks.add_task(run_bg)
    return {"investigation_id": inv_id, "status": "RUNNING"}


@router.get("/investigations")
def list_investigations(
    incident_id: str = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(AIInvestigation)
    if incident_id:
        q = q.filter(AIInvestigation.incident_id == incident_id)
    invs = q.order_by(AIInvestigation.started_at.desc()).limit(20).all()
    return [
        {
            "id": i.id,
            "incident_id": i.incident_id,
            "status": i.status,
            "confidence_score": i.confidence_score,
            "started_at": i.started_at.isoformat(),
            "completed_at": i.completed_at.isoformat() if i.completed_at else None,
        }
        for i in invs
    ]


@router.get("/investigations/{investigation_id}")
@router.get("/investigate/{investigation_id}")
@router.get("/investigation/{investigation_id}")
def get_investigation(
    investigation_id: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    inv = db.query(AIInvestigation).filter(
        (AIInvestigation.id == investigation_id) | (AIInvestigation.incident_id == investigation_id)
    ).order_by(AIInvestigation.started_at.desc()).first()
    if not inv:
        raise HTTPException(404, "Investigation not found")
    return {
        "id": inv.id,
        "incident_id": inv.incident_id,
        "model_name": inv.model_name,
        "status": inv.status,
        "root_cause_summary": inv.root_cause_summary,
        "evidence_items": inv.evidence_items,
        "recommended_actions": inv.recommended_actions,
        "confidence_score": inv.confidence_score,
        "started_at": inv.started_at.isoformat(),
        "completed_at": inv.completed_at.isoformat() if inv.completed_at else None,
    }
