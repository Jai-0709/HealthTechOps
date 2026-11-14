import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Enum as SAEnum, ForeignKey, Text, Integer
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.types import JSON
from app.core.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    severity: Mapped[str] = mapped_column(
        SAEnum("INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL", name="incident_severity"),
        default="LOW",
    )
    status: Mapped[str] = mapped_column(
        SAEnum("OPEN", "INVESTIGATING", "ACKNOWLEDGED", "REMEDIATION_PENDING", "RESOLVED", "CLOSED", name="incident_status"),
        default="OPEN",
    )
    service_id: Mapped[str] = mapped_column(String(36), ForeignKey("services.id"), nullable=True)
    detected_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    assigned_to: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    root_cause_notes: Mapped[str] = mapped_column(Text, nullable=True)
    evidence: Mapped[dict] = mapped_column(JSON, default=dict)
    dedup_hash: Mapped[str] = mapped_column(String(64), nullable=True, index=True)

    service: Mapped["Service"] = relationship("Service", foreign_keys=[service_id])  # type: ignore
    assignee: Mapped["User"] = relationship("User", foreign_keys=[assigned_to])  # type: ignore
    events: Mapped[list["IncidentEvent"]] = relationship("IncidentEvent", back_populates="incident")


class IncidentEvent(Base):
    __tablename__ = "incident_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    incident_id: Mapped[str] = mapped_column(String(36), ForeignKey("incidents.id"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    actor_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)

    incident: Mapped["Incident"] = relationship("Incident", back_populates="events")
    actor: Mapped["User"] = relationship("User", foreign_keys=[actor_id])  # type: ignore
