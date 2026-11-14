import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.audit import AuditLog


def log_action(
    db: Session,
    action: str,
    user_email: str = None,
    user_role: str = None,
    resource_type: str = None,
    resource_id: str = None,
    outcome: str = "SUCCESS",
    ip_address: str = None,
    metadata: dict = None,
):
    entry = AuditLog(
        id=str(uuid.uuid4()),
        action=action,
        user_email=user_email,
        user_role=user_role,
        resource_type=resource_type,
        resource_id=resource_id,
        outcome=outcome,
        ip_address=ip_address,
        metadata_=metadata or {},
        created_at=datetime.now(timezone.utc),
    )
    db.add(entry)
    try:
        db.commit()
    except Exception:
        db.rollback()
