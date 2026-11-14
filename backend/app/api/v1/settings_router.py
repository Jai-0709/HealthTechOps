from fastapi import APIRouter, Depends
from app.core.security import get_current_user, require_role
from app.core.config import settings
import httpx

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
def get_settings(current_user=Depends(require_role("ADMIN"))):
    return {
        "app_name": settings.APP_NAME,
        "app_version": settings.APP_VERSION,
        "ollama_model": settings.OLLAMA_MODEL,
        "ollama_base_url": settings.OLLAMA_BASE_URL,
        "incident_detection_interval": settings.INCIDENT_DETECTION_INTERVAL_SECONDS,
        "monitoring_interval": settings.MONITORING_INTERVAL_SECONDS,
    }


@router.get("/health")
def health(_=Depends(get_current_user)):
    return {"status": "healthy", "version": settings.APP_VERSION, "app": settings.APP_NAME}
