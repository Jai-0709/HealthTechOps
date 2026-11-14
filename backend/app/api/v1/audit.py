from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_role
from app.models.audit import AuditLog

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("")
def list_audit_logs(
    action: str = None,
    user_email: str = None,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
    _=Depends(require_role("ADMIN", "SRE_ENGINEER")),
):
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action.contains(action))
    if user_email:
        q = q.filter(AuditLog.user_email == user_email)
    logs = q.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "user_email": l.user_email,
            "user_role": l.user_role,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "outcome": l.outcome,
            "ip_address": l.ip_address,
            "created_at": l.created_at.isoformat(),
        }
        for l in logs
    ]
