"""
HealthTechOps Backend — FastAPI Application
AI-powered cloud reliability & autonomous incident operations platform.
All data is SYNTHETIC. Not an official Optum product.
"""
import logging
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_tables, SessionLocal
from app.api.v1.router import api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


def seed_database():
    """Seed initial data on first run."""
    db = SessionLocal()
    try:
        from app.models.user import User
        from app.models.service import Service
        from app.models.incident import Incident, IncidentEvent
        from app.models.runbook import Runbook
        from app.models.slo import SLOConfig
        from app.models.evaluation import EvaluationTestCase
        from app.core.security import get_password_hash

        # --- Users ---
        if db.query(User).count() == 0:
            users = [
                User(id=str(uuid.uuid4()), email="admin@healthtechops.local", full_name="Admin User",
                     role="ADMIN", hashed_password=get_password_hash("HealthTechOps2024!"), is_active=True),
                User(id=str(uuid.uuid4()), email="sre@healthtechops.local", full_name="SRE Engineer",
                     role="SRE_ENGINEER", hashed_password=get_password_hash("HealthTechOps2024!"), is_active=True),
                User(id=str(uuid.uuid4()), email="viewer@healthtechops.local", full_name="Operations Viewer",
                     role="VIEWER", hashed_password=get_password_hash("HealthTechOps2024!"), is_active=True),
            ]
            db.add_all(users)
            db.flush()
            logger.info("✓ Seeded 3 users")

        # --- Services ---
        if db.query(Service).count() == 0:
            service_defs = [
                {"name": "Claims API", "slug": "claims-api",
                 "description": "Core claims processing REST API for healthcare claim submission and adjudication", "port": 8010},
                {"name": "Provider Portal", "slug": "provider-portal",
                 "description": "Healthcare provider self-service portal with authentication and benefits lookup", "port": 8011},
                {"name": "Pharmacy Service", "slug": "pharmacy-service",
                 "description": "Prescription routing and drug interaction verification service", "port": 8012},
                {"name": "Identity Service", "slug": "identity-service",
                 "description": "OAuth2/OIDC authentication and role-based access control service", "port": 8013},
                {"name": "Notification Service", "slug": "notification-service",
                 "description": "Multi-channel notification dispatch (email, SMS, push) for patient alerts", "port": 8014},
                {"name": "Database Service", "slug": "database-service",
                 "description": "Managed PostgreSQL proxy with connection pooling and query caching", "port": 8015},
            ]
            svcs = []
            for sd in service_defs:
                s = Service(
                    id=str(uuid.uuid4()), name=sd["name"], slug=sd["slug"],
                    description=sd["description"], status="UNKNOWN",
                    cpu_percent=15.0, memory_percent=40.0, uptime_percent=99.9,
                    avg_latency_ms=120.0, request_count=10000, error_count=5, port=sd["port"],
                )
                db.add(s)
                svcs.append(s)
            db.flush()

            for svc in svcs:
                db.add(SLOConfig(
                    service_id=svc.id,
                    availability_target=99.9,
                    latency_p95_target_ms=500.0,
                    error_rate_target=0.5,
                    window_days=30,
                ))
            logger.info("✓ Seeded 6 services + SLO configs")

        # --- Runbooks ---
        if db.query(Runbook).count() == 0:
            runbooks = [
                Runbook(id=str(uuid.uuid4()), name="restart_service", slug="restart-service",
                        description="Gracefully restart a degraded service to clear transient faults",
                        risk_level="MEDIUM", is_allowlisted=True, service_type="all",
                        steps=["Verify service is in DEGRADED state", "Send SIGTERM to process",
                               "Wait 30s for graceful shutdown", "Start service with original parameters",
                               "Verify health endpoint returns 200", "Monitor for 2 minutes"],
                        created_at=datetime.now(timezone.utc)),
                Runbook(id=str(uuid.uuid4()), name="clear_cache", slug="clear-cache",
                        description="Flush in-memory caches to resolve stale data issues",
                        risk_level="LOW", is_allowlisted=True, service_type="all",
                        steps=["Connect to cache service", "Issue FLUSHDB command",
                               "Verify cache is empty", "Monitor cache hit ratio for 5 minutes"],
                        created_at=datetime.now(timezone.utc)),
                Runbook(id=str(uuid.uuid4()), name="scale_up_replicas", slug="scale-up-replicas",
                        description="Increase service replica count to handle elevated load",
                        risk_level="LOW", is_allowlisted=True, service_type="all",
                        steps=["Check current replica count", "Verify resource headroom",
                               "Set replicas to target count", "Wait for all replicas to become ready",
                               "Verify load is distributed"],
                        created_at=datetime.now(timezone.utc)),
                Runbook(id=str(uuid.uuid4()), name="rollback_deployment", slug="rollback-deployment",
                        description="Revert a service to the previous stable deployment",
                        risk_level="HIGH", is_allowlisted=True, service_type="all",
                        steps=["Identify last stable deployment tag", "Pause incoming traffic",
                               "Deploy previous image tag", "Run smoke tests",
                               "Resume traffic", "Monitor for 10 minutes"],
                        created_at=datetime.now(timezone.utc)),
                Runbook(id=str(uuid.uuid4()), name="flush_connection_pool", slug="flush-connection-pool",
                        description="Reset database connection pool to clear stale or leaked connections",
                        risk_level="LOW", is_allowlisted=True, service_type="database-service",
                        steps=["List active connections", "Drain connection pool gracefully",
                               "Reinitialise pool with fresh connections",
                               "Verify connection count returns to normal"],
                        created_at=datetime.now(timezone.utc)),
            ]
            db.add_all(runbooks)
            logger.info("✓ Seeded 5 runbooks")

        # --- Historical Incidents ---
        if db.query(Incident).count() == 0:
            svcs_map = {s.slug: s for s in db.query(Service).all()}
            default = db.query(Service).first()

            incidents = [
                Incident(id=str(uuid.uuid4()),
                         title="Claims API elevated error rate",
                         description="Claims API error rate exceeded 5% threshold. Downstream services affected.",
                         severity="HIGH", status="RESOLVED",
                         service_id=(svcs_map.get("claims-api") or default).id,
                         detected_at=datetime(2026, 11, 10, 2, 15, tzinfo=timezone.utc),
                         resolved_at=datetime(2026, 11, 10, 3, 42, tzinfo=timezone.utc),
                         root_cause_notes="Stale database connections caused query timeouts. Flushing connection pool resolved the issue.",
                         evidence={"error_rate": 5.2, "cpu": 78, "memory": 65}),
                Incident(id=str(uuid.uuid4()),
                         title="Identity Service memory leak detected",
                         description="Identity service memory usage grew from 60% to 94% over 2 hours.",
                         severity="CRITICAL", status="RESOLVED",
                         service_id=(svcs_map.get("identity-service") or default).id,
                         detected_at=datetime(2026, 11, 11, 14, 0, tzinfo=timezone.utc),
                         resolved_at=datetime(2026, 11, 11, 15, 10, tzinfo=timezone.utc),
                         root_cause_notes="JWT token cache not expiring entries. Restart cleared memory.",
                         evidence={"memory": 94, "cpu": 45}),
                Incident(id=str(uuid.uuid4()),
                         title="Pharmacy Service high latency",
                         description="P95 latency exceeded 2000ms for prescription routing requests.",
                         severity="MEDIUM", status="RESOLVED",
                         service_id=(svcs_map.get("pharmacy-service") or default).id,
                         detected_at=datetime(2026, 11, 12, 9, 30, tzinfo=timezone.utc),
                         resolved_at=datetime(2026, 11, 12, 10, 5, tzinfo=timezone.utc),
                         root_cause_notes="Drug interaction API downstream was slow. Increased timeout.",
                         evidence={"latency_p95": 2150, "error_rate": 0.3}),
                Incident(id=str(uuid.uuid4()),
                         title="Provider Portal CPU spike",
                         description="Provider portal CPU usage spiked to 95% during morning peak traffic.",
                         severity="HIGH", status="OPEN",
                         service_id=(svcs_map.get("provider-portal") or default).id,
                         detected_at=datetime(2026, 11, 13, 8, 0, tzinfo=timezone.utc),
                         evidence={"cpu": 95, "memory": 72, "latency": 1800}),
                Incident(id=str(uuid.uuid4()),
                         title="Notification Service queue backlog",
                         description="Email notification queue depth exceeded 10,000 messages.",
                         severity="MEDIUM", status="INVESTIGATING",
                         service_id=(svcs_map.get("notification-service") or default).id,
                         detected_at=datetime(2026, 11, 13, 10, 45, tzinfo=timezone.utc),
                         evidence={"queue_depth": 10234, "cpu": 35, "memory": 58}),
            ]
            for inc in incidents:
                db.add(inc)
            db.flush()
            for inc in incidents:
                db.add(IncidentEvent(
                    incident_id=inc.id, event_type="DETECTED",
                    description="Incident detected by monitoring agent",
                    occurred_at=inc.detected_at,
                ))
            logger.info("✓ Seeded 5 historical incidents")

        # --- Evaluation Test Cases ---
        from app.models.evaluation import EvaluationTestCase
        if db.query(EvaluationTestCase).count() == 0:
            test_cases = [
                EvaluationTestCase(
                    name="Memory Exhaustion",
                    description="Service memory at 95%, OOM killer triggered",
                    synthetic_incident={"title": "Service memory exhaustion", "severity": "CRITICAL",
                                        "service_name": "claims-api", "description": "Memory usage at 95%, OOM killer triggered"},
                    expected_root_cause="memory leak or insufficient memory limits",
                    expected_actions=["restart_service", "scale_up_replicas"],
                ),
                EvaluationTestCase(
                    name="High API Latency",
                    description="P95 latency over 3 seconds",
                    synthetic_incident={"title": "High API latency", "severity": "HIGH",
                                        "service_name": "provider-portal", "description": "P95 response time is 3200ms"},
                    expected_root_cause="slow downstream dependency or database query",
                    expected_actions=["increase_timeout", "clear_cache"],
                ),
                EvaluationTestCase(
                    name="Connection Pool Exhausted",
                    description="All DB connections in use",
                    synthetic_incident={"title": "Database connection pool exhausted", "severity": "CRITICAL",
                                        "service_name": "database-service", "description": "All 100 database connections are in use"},
                    expected_root_cause="connection leak or insufficient pool size",
                    expected_actions=["flush_connection_pool", "restart_service"],
                ),
                EvaluationTestCase(
                    name="CPU Spike",
                    description="CPU at 98% sustained for 10 minutes",
                    synthetic_incident={"title": "Sustained CPU spike", "severity": "HIGH",
                                        "service_name": "pharmacy-service", "description": "CPU at 98% for 10 minutes, request queue building"},
                    expected_root_cause="inefficient algorithm or infinite loop",
                    expected_actions=["scale_up_replicas", "rollback_deployment"],
                ),
                EvaluationTestCase(
                    name="Error Rate Surge Post-Deploy",
                    description="Error rate from 0.1% to 8% after deploy",
                    synthetic_incident={"title": "Error rate surge", "severity": "HIGH",
                                        "service_name": "identity-service", "description": "HTTP 500 rate jumped from 0.1% to 8% after deployment"},
                    expected_root_cause="bad deployment introduced regression",
                    expected_actions=["rollback_deployment"],
                ),
            ]
            db.add_all(test_cases)
            logger.info("✓ Seeded 5 evaluation test cases")

        # --- Metric Observations ---
        from app.models.slo import MetricObservation
        if db.query(MetricObservation).count() == 0:
            import random
            from datetime import timedelta
            now = datetime.now(timezone.utc)
            obs_list = []
            for svc in db.query(Service).all():
                base_cpu = svc.cpu_percent or 25.0
                base_mem = svc.memory_percent or 45.0
                base_lat = svc.avg_latency_ms or 120.0
                for step in range(60, 0, -1):
                    ts = now - timedelta(minutes=step * 2)
                    noise = random.uniform(-4.0, 4.0)
                    cpu_val = max(5.0, min(95.0, base_cpu + noise))
                    mem_val = max(10.0, min(90.0, base_mem + (noise * 0.4)))
                    lat_val = max(20.0, base_lat + (noise * 2.5))
                    obs_list.append(
                        MetricObservation(
                            service_id=svc.id,
                            timestamp=ts,
                            cpu_percent=round(cpu_val, 1),
                            memory_percent=round(mem_val, 1),
                            request_count=random.randint(150, 400),
                            error_count=random.randint(0, 2),
                            avg_latency_ms=round(lat_val, 1),
                            p95_latency_ms=round(lat_val * 1.3, 1),
                            is_healthy=True,
                        )
                    )
            db.add_all(obs_list)
            logger.info(f"✓ Seeded {len(obs_list)} historical metric observations")

        db.commit()
        logger.info("Database seeding complete ✓")

    except Exception as e:
        logger.error(f"Seeding error: {e}")
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 50)
    logger.info("HealthTechOps Backend starting...")
    logger.info("SYNTHETIC ENVIRONMENT — not an official Optum product")
    if settings.JWT_SECRET_KEY.startswith("supersecretkey"):
        logger.warning("SECURITY NOTICE: Using development JWT_SECRET_KEY. Set a secure key in .env for production.")
    logger.info("=" * 50)
    create_tables()
    seed_database()
    from app.services.incident_detector import start_detector
    start_detector()
    logger.info("Backend ready ✓  →  http://localhost:8000")
    yield
    logger.info("Shutting down...")
    from app.services.incident_detector import stop_detector
    stop_detector()


app = FastAPI(
    title="HealthTechOps API",
    description="AI-powered cloud reliability & incident operations platform (synthetic environment)",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
def health():
    return {"status": "healthy", "service": "HealthTechOps API", "version": "1.0.0", "synthetic": True}


app.include_router(api_router)
