from fastapi import APIRouter
from app.api.v1 import (
    auth, overview, services, incidents, ai,
    infrastructure, runbooks, remediation, slo,
    observability, audit, evaluation, settings_router,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(overview.router)
api_router.include_router(services.router)
api_router.include_router(incidents.router)
api_router.include_router(ai.router)
api_router.include_router(infrastructure.router)
api_router.include_router(runbooks.router)
api_router.include_router(remediation.router)
api_router.include_router(slo.router)
api_router.include_router(observability.router)
api_router.include_router(audit.router)
api_router.include_router(evaluation.router)
api_router.include_router(settings_router.router)
