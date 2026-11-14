"""
HealthTechOps Monitoring Agent
Collects host system metrics using psutil and exposes them via Prometheus client.
Pings synthetic services every 15 seconds.
"""
import os
import time
import logging
import threading
import httpx
from prometheus_client import start_http_server, Gauge, Counter
import psutil

SIMULATOR_HOST = os.getenv("SIMULATOR_HOST", "localhost")

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

# Prometheus metrics
cpu_gauge = Gauge('healthtechops_cpu_usage_percent', 'Host CPU usage percent')
memory_gauge = Gauge('healthtechops_memory_usage_percent', 'Host memory usage percent')
disk_gauge = Gauge('healthtechops_disk_usage_percent', 'Host disk usage percent')
net_sent_gauge = Gauge('healthtechops_network_bytes_sent_total', 'Network bytes sent')
net_recv_gauge = Gauge('healthtechops_network_bytes_recv_total', 'Network bytes received')

service_up_gauge = Gauge('healthtechops_service_up', 'Service health (1=up, 0=down)', ['service'])
service_cpu_gauge = Gauge('healthtechops_service_cpu_percent', 'Service CPU percent', ['service'])
service_memory_gauge = Gauge('healthtechops_service_memory_percent', 'Service memory percent', ['service'])
service_latency_gauge = Gauge('healthtechops_service_latency_ms', 'Service avg latency ms', ['service'])
service_error_rate_gauge = Gauge('healthtechops_service_error_rate', 'Service error rate', ['service'])

SYNTHETIC_SERVICES = [
    {"name": "claims-api", "port": 8010},
    {"name": "provider-portal", "port": 8011},
    {"name": "pharmacy-service", "port": 8012},
    {"name": "identity-service", "port": 8013},
    {"name": "notification-service", "port": 8014},
    {"name": "database-service", "port": 8015},
]

def collect_host_metrics():
    while True:
        try:
            cpu_gauge.set(psutil.cpu_percent(interval=1))
            mem = psutil.virtual_memory()
            memory_gauge.set(mem.percent)
            disk = psutil.disk_usage('/')
            disk_gauge.set(disk.percent)
            net = psutil.net_io_counters()
            net_sent_gauge.set(net.bytes_sent)
            net_recv_gauge.set(net.bytes_recv)
            logger.debug(f"Host metrics: CPU={psutil.cpu_percent()}% MEM={mem.percent}%")
        except Exception as e:
            logger.error(f"Error collecting host metrics: {e}")
        time.sleep(15)

def ping_services():
    while True:
        for svc in SYNTHETIC_SERVICES:
            name = svc['name']
            port = svc['port']
            try:
                resp = httpx.get(f"http://{SIMULATOR_HOST}:{port}/health", timeout=5.0)
                data = resp.json()
                is_up = 1 if data.get('status') == 'healthy' else 0.5 if data.get('status') == 'degraded' else 0
                service_up_gauge.labels(service=name).set(is_up)
                service_cpu_gauge.labels(service=name).set(data.get('cpu_percent', 0))
                service_memory_gauge.labels(service=name).set(data.get('memory_percent', 0))
                service_latency_gauge.labels(service=name).set(data.get('avg_latency_ms', 0))
                service_error_rate_gauge.labels(service=name).set(data.get('error_rate', 0))
            except Exception:
                service_up_gauge.labels(service=name).set(0)
        time.sleep(15)

if __name__ == '__main__':
    logger.info("Starting HealthTechOps Monitoring Agent on port 9100")
    start_http_server(9100)
    
    host_thread = threading.Thread(target=collect_host_metrics, daemon=True)
    host_thread.start()
    
    services_thread = threading.Thread(target=ping_services, daemon=True)
    services_thread.start()
    
    logger.info("Monitoring agent running. Metrics at http://localhost:9100/metrics")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Monitoring agent stopped")
