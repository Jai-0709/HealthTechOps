"""
HealthTechOps Synthetic Service Simulator
Runs 6 fake healthcare microservices for demonstration purposes.
All data is synthetic - no real health records or PHI.
"""
import threading
import time
import random
import math
import json
import logging
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from flask_cors import CORS

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

SERVICES = [
    {"name": "claims-api",          "port": 8010, "description": "Claims processing REST API"},
    {"name": "provider-portal",     "port": 8011, "description": "Provider self-service portal"},
    {"name": "pharmacy-service",    "port": 8012, "description": "Prescription routing service"},
    {"name": "identity-service",    "port": 8013, "description": "OAuth2/OIDC authentication"},
    {"name": "notification-service","port": 8014, "description": "Multi-channel notification dispatch"},
    {"name": "database-service",    "port": 8015, "description": "PostgreSQL proxy with connection pooling"},
]

LOG_TEMPLATES = [
    ("{level}", "Request processed successfully in {latency}ms"),
    ("{level}", "Cache hit ratio: {cache_hit}%"),
    ("{level}", "Database query completed in {db_latency}ms"),
    ("{level}", "Health check passed"),
    ("{level}", "Authentication token validated"),
    ("WARN", "High latency detected: {latency}ms"),
    ("WARN", "Memory pressure: {memory}%"),
    ("ERROR", "Request timeout after 30000ms"),
    ("ERROR", "Upstream service unavailable"),
    ("INFO", "Circuit breaker: CLOSED"),
    ("INFO", "Connection pool: {active}/20 active"),
]

class SyntheticService:
    def __init__(self, name: str, port: int, description: str):
        self.name = name
        self.port = port
        self.description = description
        
        # Baseline metrics
        self.base_cpu = random.uniform(10, 30)
        self.base_memory = random.uniform(30, 55)
        self.base_latency = random.uniform(50, 200)
        self.base_error_rate = random.uniform(0.01, 0.1)
        
        # Current metrics (updated by background thread)
        self.cpu_percent = self.base_cpu
        self.memory_percent = self.base_memory
        self.avg_latency_ms = self.base_latency
        self.error_rate = self.base_error_rate
        self.request_count = random.randint(1000, 50000)
        self.error_count = int(self.request_count * self.base_error_rate / 100)
        self.uptime_percent = 99.9
        self.status = "healthy"
        
        # Failure injection state
        self.failure_active = False
        self.failure_type = None
        self.failure_expires_at = None
        
        # Log buffer
        self.log_buffer = []
        self._add_startup_logs()
        
        # Reentrant lock to prevent deadlocks when methods call other locked methods
        self._lock = threading.RLock()
    
    def _add_startup_logs(self):
        now = datetime.now(timezone.utc)
        self.log_buffer = [
            {"timestamp": now.isoformat(), "level": "INFO", "message": f"{self.name} started on port {self.port}", "trace_id": f"trace-{random.randint(100000,999999)}"},
            {"timestamp": now.isoformat(), "level": "INFO", "message": "Database connection pool initialized (20 connections)", "trace_id": f"trace-{random.randint(100000,999999)}"},
            {"timestamp": now.isoformat(), "level": "INFO", "message": "Health check endpoint registered at /health", "trace_id": f"trace-{random.randint(100000,999999)}"},
        ]
    
    def add_log(self, level: str, message: str):
        with self._lock:
            self.log_buffer.append({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "level": level,
                "message": message,
                "trace_id": f"trace-{random.randint(100000,999999)}",
            })
            if len(self.log_buffer) > 200:
                self.log_buffer = self.log_buffer[-200:]
    
    def update_metrics(self):
        """Called every 10s by background thread to update metrics with realistic variance."""
        with self._lock:
            # Check if failure has expired
            if self.failure_active and self.failure_expires_at:
                if datetime.now(timezone.utc).timestamp() > self.failure_expires_at:
                    self.failure_active = False
                    self.failure_type = None
                    self.failure_expires_at = None
                    self.status = "healthy"
                    self.add_log("INFO", "Failure condition cleared - service recovered")
            
            if self.failure_active:
                ft = self.failure_type
                if ft == "cpu_spike":
                    self.cpu_percent = min(99, self.base_cpu + random.uniform(50, 70))
                    self.memory_percent = self.base_memory + random.uniform(5, 15)
                    self.avg_latency_ms = self.base_latency * random.uniform(2, 5)
                    self.error_rate = self.base_error_rate * 3
                    self.status = "degraded"
                elif ft == "memory_exhaustion":
                    self.memory_percent = min(97, self.base_memory + random.uniform(35, 45))
                    self.cpu_percent = self.base_cpu + random.uniform(10, 20)
                    self.avg_latency_ms = self.base_latency * random.uniform(3, 8)
                    self.error_rate = self.base_error_rate * 10
                    self.status = "degraded"
                elif ft == "high_latency":
                    self.avg_latency_ms = self.base_latency * random.uniform(10, 20)
                    self.cpu_percent = self.base_cpu + random.uniform(5, 15)
                    self.error_rate = self.base_error_rate * 5
                    self.status = "degraded"
                elif ft == "error_spike":
                    self.error_rate = random.uniform(5, 15)
                    self.avg_latency_ms = self.base_latency * random.uniform(2, 4)
                    self.status = "degraded"
                elif ft == "service_down":
                    self.status = "down"
                    self.cpu_percent = 0
                    self.memory_percent = 0
                    self.avg_latency_ms = 0
            else:
                # Normal variance with sinusoidal pattern
                t = time.time()
                wave = math.sin(t / 300) * 0.2  # slow wave
                noise = random.uniform(-0.05, 0.05)
                
                self.cpu_percent = max(1, self.base_cpu * (1 + wave + noise + random.uniform(-0.1, 0.1)))
                self.memory_percent = max(1, self.base_memory * (1 + wave * 0.3 + random.uniform(-0.03, 0.03)))
                self.avg_latency_ms = max(5, self.base_latency * (1 + abs(wave) * 0.5 + random.uniform(-0.1, 0.1)))
                self.error_rate = max(0, self.base_error_rate + random.uniform(-0.01, 0.01))
                self.status = "healthy"
            
            # Update counters
            new_requests = random.randint(10, 100)
            self.request_count += new_requests
            self.error_count += int(new_requests * self.error_rate / 100)
            
            # Add a log entry
            level = "ERROR" if self.error_rate > 1 else "WARN" if self.error_rate > 0.3 else "INFO"
            tmpl = random.choice(LOG_TEMPLATES)
            msg = tmpl[1].format(
                latency=int(self.avg_latency_ms),
                cache_hit=random.randint(60, 95),
                db_latency=random.randint(5, 50),
                memory=int(self.memory_percent),
                active=random.randint(1, 20),
            )
            self.add_log(level, msg)
    
    def inject_failure(self, failure_type: str, duration_seconds: int):
        with self._lock:
            if failure_type not in ["cpu_spike", "memory_exhaustion", "high_latency", "error_spike", "service_down"]:
                raise ValueError(f"Unknown failure type: {failure_type}")
            duration_seconds = min(300, max(10, duration_seconds))
            self.failure_active = True
            self.failure_type = failure_type
            self.failure_expires_at = datetime.now(timezone.utc).timestamp() + duration_seconds
            
            # Immediately update status & metrics so health check reflects failure instantly
            if failure_type == "cpu_spike":
                self.cpu_percent = min(99, self.base_cpu + random.uniform(50, 70))
                self.memory_percent = self.base_memory + random.uniform(5, 15)
                self.avg_latency_ms = self.base_latency * random.uniform(2, 5)
                self.error_rate = self.base_error_rate * 3
                self.status = "degraded"
            elif failure_type == "memory_exhaustion":
                self.memory_percent = min(97, self.base_memory + random.uniform(35, 45))
                self.cpu_percent = self.base_cpu + random.uniform(10, 20)
                self.avg_latency_ms = self.base_latency * random.uniform(3, 8)
                self.error_rate = self.base_error_rate * 10
                self.status = "degraded"
            elif failure_type == "high_latency":
                self.avg_latency_ms = self.base_latency * random.uniform(10, 20)
                self.cpu_percent = self.base_cpu + random.uniform(5, 15)
                self.error_rate = self.base_error_rate * 5
                self.status = "degraded"
            elif failure_type == "error_spike":
                self.error_rate = random.uniform(5, 15)
                self.avg_latency_ms = self.base_latency * random.uniform(2, 4)
                self.status = "degraded"
            elif failure_type == "service_down":
                self.status = "down"
                self.cpu_percent = 0
                self.memory_percent = 0
                self.avg_latency_ms = 0

            self.add_log("WARN", f"[SYNTHETIC FAILURE] Injected: {failure_type} for {duration_seconds}s")
    
    def get_health(self) -> dict:
        with self._lock:
            return {
                "service": self.name,
                "status": self.status,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "cpu_percent": round(self.cpu_percent, 2),
                "memory_percent": round(self.memory_percent, 2),
                "avg_latency_ms": round(self.avg_latency_ms, 2),
                "error_rate": round(self.error_rate, 4),
                "request_count": self.request_count,
                "error_count": self.error_count,
                "uptime_percent": self.uptime_percent,
                "failure_active": self.failure_active,
                "failure_type": self.failure_type,
                "synthetic": True,
            }
    
    def get_logs(self) -> dict:
        with self._lock:
            return {"service": self.name, "logs": list(reversed(self.log_buffer[-50:]))}
    
    def get_prometheus_metrics(self) -> str:
        with self._lock:
            name_safe = self.name.replace("-", "_")
            return f"""# HELP {name_safe}_cpu_usage_percent CPU usage percentage
# TYPE {name_safe}_cpu_usage_percent gauge
{name_safe}_cpu_usage_percent {self.cpu_percent:.2f}
# HELP {name_safe}_memory_usage_percent Memory usage percentage
# TYPE {name_safe}_memory_usage_percent gauge
{name_safe}_memory_usage_percent {self.memory_percent:.2f}
# HELP {name_safe}_request_latency_ms Average request latency in ms
# TYPE {name_safe}_request_latency_ms gauge
{name_safe}_request_latency_ms {self.avg_latency_ms:.2f}
# HELP {name_safe}_request_total Total requests processed
# TYPE {name_safe}_request_total counter
{name_safe}_request_total {self.request_count}
# HELP {name_safe}_error_total Total errors
# TYPE {name_safe}_error_total counter
{name_safe}_error_total {self.error_count}
"""


def create_service_app(service: SyntheticService) -> Flask:
    app = Flask(service.name)
    CORS(app)

    @app.route('/health')
    def health():
        h = service.get_health()
        code = 200 if h['status'] == 'healthy' else 503 if h['status'] == 'down' else 207
        return jsonify(h), code

    @app.route('/metrics')
    def metrics():
        return jsonify(service.get_health())

    @app.route('/logs')
    def logs():
        return jsonify(service.get_logs())

    @app.route('/prometheus-metrics')
    def prometheus():
        from flask import Response
        return Response(service.get_prometheus_metrics(), mimetype='text/plain')

    @app.route('/inject-failure', methods=['POST'])
    def inject():
        data = request.get_json() or {}
        failure_type = data.get('failure_type', 'cpu_spike')
        duration = int(data.get('duration_seconds', 60))
        try:
            service.inject_failure(failure_type, duration)
            return jsonify({"status": "injected", "failure_type": failure_type, "duration_seconds": duration, "synthetic": True})
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    @app.route('/remediate', methods=['POST'])
    @app.route('/reset', methods=['POST'])
    def remediate():
        data = request.get_json() or {}
        action = data.get('action', 'restart_service')
        with service._lock:
            service.failure_active = False
            service.failure_type = None
            service.failure_expires_at = 0
            service.status = "healthy"
            service.cpu_percent = service.base_cpu
            service.memory_percent = service.base_memory
            service.avg_latency_ms = service.base_latency
            service.error_rate = service.base_error_rate
            service.add_log("INFO", f"[REMEDIATION APPLIED] Executed {action} - microservice recovered to healthy baseline")
        return jsonify({"status": "remediated", "action": action, "service": service.name, "synthetic": True})

    @app.route('/info')
    def info():
        return jsonify({"name": service.name, "port": service.port, "description": service.description, "synthetic": True})

    return app


def metrics_updater(services: list):
    """Background thread that updates all service metrics every 10s."""
    while True:
        for svc in services:
            try:
                svc.update_metrics()
            except Exception as e:
                logger.error(f"Error updating {svc.name}: {e}")
        time.sleep(10)


def run_service(service_obj: SyntheticService):
    app = create_service_app(service_obj)
    logger.info(f"Starting {service_obj.name} on port {service_obj.port}")
    app.run(host='0.0.0.0', port=service_obj.port, debug=False, use_reloader=False, threaded=True)


if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("HealthTechOps Synthetic Service Simulator")
    logger.info("All data is SYNTHETIC - not real patient data")
    logger.info("=" * 60)
    
    # Create service objects
    service_objects = [
        SyntheticService(s['name'], s['port'], s['description'])
        for s in SERVICES
    ]
    
    # Start metrics updater thread
    updater = threading.Thread(target=metrics_updater, args=(service_objects,), daemon=True)
    updater.start()
    logger.info("Metrics updater thread started")
    
    # Start each service in its own thread
    threads = []
    for svc_obj in service_objects:
        t = threading.Thread(target=run_service, args=(svc_obj,), daemon=True)
        t.start()
        threads.append(t)
        time.sleep(0.5)  # Stagger startup
    
    logger.info(f"All {len(SERVICES)} synthetic services started")
    logger.info("Services running on ports 8010-8015")
    logger.info("Press Ctrl+C to stop")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down simulator...")
