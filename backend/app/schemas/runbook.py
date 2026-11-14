from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class RunbookResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    risk_level: str
    steps: List = []
    is_allowlisted: bool
    service_type: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
