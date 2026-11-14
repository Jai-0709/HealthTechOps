import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship
from app.core.database import Base


class Service(Base):
    __tablename__ = "services"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(1000), nullable=True)
    status: Mapped[str] = mapped_column(
        SAEnum("HEALTHY", "DEGRADED", "DOWN", "UNKNOWN", name="service_status"),
        default="UNKNOWN",
    )
    cpu_percent: Mapped[float] = mapped_column(Float, default=0.0)
    memory_percent: Mapped[float] = mapped_column(Float, default=0.0)
    request_count: Mapped[int] = mapped_column(Integer, default=0)
    error_count: Mapped[int] = mapped_column(Integer, default=0)
    avg_latency_ms: Mapped[float] = mapped_column(Float, default=0.0)
    uptime_percent: Mapped[float] = mapped_column(Float, default=100.0)
    last_checked: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    port: Mapped[int] = mapped_column(Integer, nullable=True)

    dependencies: Mapped[list["ServiceDependency"]] = relationship(
        "ServiceDependency", foreign_keys="ServiceDependency.service_id", back_populates="service"
    )


class ServiceDependency(Base):
    __tablename__ = "service_dependencies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    service_id: Mapped[str] = mapped_column(String(36), ForeignKey("services.id"), nullable=False)
    depends_on_id: Mapped[str] = mapped_column(String(36), ForeignKey("services.id"), nullable=False)

    service: Mapped["Service"] = relationship("Service", foreign_keys=[service_id], back_populates="dependencies")
    depends_on: Mapped["Service"] = relationship("Service", foreign_keys=[depends_on_id])
