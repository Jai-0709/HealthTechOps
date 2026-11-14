from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class EvaluationTestCaseResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    expected_root_cause: Optional[str] = None
    expected_actions: List = []

    class Config:
        from_attributes = True


class EvaluationRunResponse(BaseModel):
    id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    model_name: str
    total_cases: int
    correct_root_causes: int
    avg_evidence_score: float
    unsafe_action_count: int
    results: List = []

    class Config:
        from_attributes = True
