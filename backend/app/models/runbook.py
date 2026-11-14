import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Boolean, Enum as SAEnum, Text
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.types import JSON
from app.core.database import Base


class Runbook(Base):
    __tablename__ = "runbooks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    risk_level: Mapped[str] = mapped_column(
        SAEnum("LOW", "MEDIUM", "HIGH", name="risk_level"),
        default="MEDIUM",
    )
    steps: Mapped[list] = mapped_column(JSON, default=list)
    is_allowlisted: Mapped[bool] = mapped_column(Boolean, default=False)
    service_type: Mapped[str] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
