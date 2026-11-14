from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship
from app.core.database import Base


class SLOConfig(Base):
    __tablename__ = "slo_configs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    service_id: Mapped[str] = mapped_column(String(36), ForeignKey("services.id"), unique=True, nullable=False)
    availability_target: Mapped[float] = mapped_column(Float, default=99.9)
    latency_p95_target_ms: Mapped[float] = mapped_column(Float, default=500.0)
    error_rate_target: Mapped[float] = mapped_column(Float, default=0.1)
    window_days: Mapped[int] = mapped_column(Integer, default=30)

    service: Mapped["Service"] = relationship("Service", foreign_keys=[service_id])  # type: ignore


class MetricObservation(Base):
    __tablename__ = "metric_observations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    service_id: Mapped[str] = mapped_column(String(36), ForeignKey("services.id"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    cpu_percent: Mapped[float] = mapped_column(Float, default=0.0)
    memory_percent: Mapped[float] = mapped_column(Float, default=0.0)
    request_count: Mapped[int] = mapped_column(Integer, default=0)
    error_count: Mapped[int] = mapped_column(Integer, default=0)
    avg_latency_ms: Mapped[float] = mapped_column(Float, default=0.0)
    p95_latency_ms: Mapped[float] = mapped_column(Float, default=0.0)
    is_healthy: Mapped[bool] = mapped_column(Boolean, default=True)

    service: Mapped["Service"] = relationship("Service", foreign_keys=[service_id])  # type: ignore
