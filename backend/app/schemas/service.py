from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class ServiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    description: Optional[str] = None
    status: str
    cpu_percent: float
    memory_percent: float
    request_count: int
    error_count: int
    avg_latency_ms: float
    uptime_percent: float
    last_checked: Optional[datetime] = None
    port: Optional[int] = None
