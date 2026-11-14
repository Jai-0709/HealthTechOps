"""
Remediation Engine: executes allowlisted remediation actions safely.
"""
from sqlalchemy.orm import Session
from app.models.remediation import RemediationRequest
from app.models.runbook import Runbook
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

ALLOWLISTED_ACTIONS = {
    "restart_service",
    "clear_cache",
    "scale_up",
    "rollback_deployment",
    "flush_connection_pool",
    "enable_circuit_breaker",
    "disable_rate_limiting",
    "rotate_credentials",
}


async def execute_remediation(db: Session, remediation_id: str) -> dict:
    req = db.query(RemediationRequest).filter(RemediationRequest.id == remediation_id).first()
    if not req:
        return {"success": False, "error": "Remediation request not found"}

    if req.status != "APPROVED":
        return {"success": False, "error": "Remediation not approved"}

    # Check if action is allowlisted
    action_key = req.action_name.lower().replace(" ", "_").replace("-", "_")
    if action_key not in ALLOWLISTED_ACTIONS:
        req.status = "FAILED"
        req.execution_result = {"error": f"Action '{req.action_name}' is not allowlisted"}
        db.commit()
        return {"success": False, "error": "Action not allowlisted"}

    req.status = "EXECUTING"
    db.commit()

    try:
        # Simulate execution (no actual system changes)
        logger.info(f"[SYNTHETIC] Executing remediation: {req.action_name} on service {req.affected_service_id}")
        result = {
            "success": True,
            "action": req.action_name,
            "executed_at": datetime.now(timezone.utc).isoformat(),
            "note": "SYNTHETIC: This is a simulated remediation — no actual system changes were made.",
        }
        req.status = "COMPLETED"
        req.execution_result = result
        req.recovery_verified = True
        db.commit()
        return result
    except Exception as e:
        req.status = "FAILED"
        req.execution_result = {"error": str(e)}
        db.commit()
        return {"success": False, "error": str(e)}
