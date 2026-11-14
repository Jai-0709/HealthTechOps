import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Boolean, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.types import JSON
from app.core.database import Base


class RemediationRequest(Base):
    __tablename__ = "remediation_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id: Mapped[str] = mapped_column(String(36), ForeignKey("incidents.id"), nullable=True)
    runbook_id: Mapped[str] = mapped_column(String(36), ForeignKey("runbooks.id"), nullable=True)
    action_name: Mapped[str] = mapped_column(String(255), nullable=False)
    risk_level: Mapped[str] = mapped_column(
        SAEnum("LOW", "MEDIUM", "HIGH", name="remediation_risk_level"),
        default="MEDIUM",
    )
    affected_service_id: Mapped[str] = mapped_column(String(36), ForeignKey("services.id"), nullable=True)
    status: Mapped[str] = mapped_column(
        SAEnum("PENDING", "APPROVED", "REJECTED", "EXECUTING", "COMPLETED", "FAILED", name="remediation_status"),
        default="PENDING",
    )
    requested_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    requested_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    reviewed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    execution_result: Mapped[dict] = mapped_column(JSON, default=dict)
    recovery_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    incident: Mapped["Incident"] = relationship("Incident", foreign_keys=[incident_id])  # type: ignore
    runbook: Mapped["Runbook"] = relationship("Runbook", foreign_keys=[runbook_id])  # type: ignore
    service: Mapped["Service"] = relationship("Service", foreign_keys=[affected_service_id])  # type: ignore
    requester: Mapped["User"] = relationship("User", foreign_keys=[requested_by])  # type: ignore
    reviewer: Mapped["User"] = relationship("User", foreign_keys=[reviewed_by])  # type: ignore
