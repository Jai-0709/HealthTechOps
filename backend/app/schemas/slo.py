from pydantic import BaseModel
from typing import Optional


class SLOResponse(BaseModel):
    service_id: str
    service_name: str
    availability_target: float
    availability_actual: float
    latency_p95_target_ms: float
    latency_p95_actual_ms: float
    error_rate_target: float
    error_rate_actual: float
    error_budget_remaining: float
    is_meeting_slo: bool
