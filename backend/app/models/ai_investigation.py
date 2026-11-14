import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Enum as SAEnum, ForeignKey, Text, Float
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.types import JSON
from app.core.database import Base


class AIInvestigation(Base):
    __tablename__ = "ai_investigations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id: Mapped[str] = mapped_column(String(36), ForeignKey("incidents.id"), nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False, default="llama3.2")
    prompt_hash: Mapped[str] = mapped_column(String(64), nullable=True)
    root_cause_summary: Mapped[str] = mapped_column(Text, nullable=True)
    evidence_items: Mapped[list] = mapped_column(JSON, default=list)
    recommended_actions: Mapped[list] = mapped_column(JSON, default=list)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    raw_response: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        SAEnum("PENDING", "RUNNING", "COMPLETED", "FAILED", name="ai_investigation_status"),
        default="PENDING",
    )
    started_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    incident: Mapped["Incident"] = relationship("Incident", foreign_keys=[incident_id])  # type: ignore
