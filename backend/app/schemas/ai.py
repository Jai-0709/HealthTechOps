from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AIInvestigationResponse(BaseModel):
    id: str
    incident_id: str
    model_name: str
    root_cause_summary: Optional[str] = None
    evidence_items: List = []
    recommended_actions: List = []
    confidence_score: float
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
