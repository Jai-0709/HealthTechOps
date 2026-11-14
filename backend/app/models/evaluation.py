from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, Float, Text
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.types import JSON
from app.core.database import Base


class EvaluationTestCase(Base):
    __tablename__ = "evaluation_test_cases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    synthetic_incident: Mapped[dict] = mapped_column(JSON, default=dict)
    expected_root_cause: Mapped[str] = mapped_column(Text, nullable=True)
    expected_actions: Mapped[list] = mapped_column(JSON, default=list)


class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    total_cases: Mapped[int] = mapped_column(Integer, default=0)
    correct_root_causes: Mapped[int] = mapped_column(Integer, default=0)
    avg_evidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    unsafe_action_count: Mapped[int] = mapped_column(Integer, default=0)
    results: Mapped[list] = mapped_column(JSON, default=list)
