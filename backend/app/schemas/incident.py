from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class IncidentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    severity: str = "LOW"
    service_id: Optional[str] = None


class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    root_cause_notes: Optional[str] = None
    assigned_to: Optional[str] = None


class IncidentEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_type: str
    description: Optional[str] = None
    occurred_at: datetime


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: Optional[str] = None
    severity: str
    status: str
    service_id: Optional[str] = None
    service_name: Optional[str] = None
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    assigned_to: Optional[str] = None
    root_cause_notes: Optional[str] = None
