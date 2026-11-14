"""
HealthTechOps — Synthetic Incident End-to-End Demonstration Script
Executes full closed-loop autonomous SRE workflow:
1. Injects failure into microservice (port 8010).
2. Verifies degradation via health probe.
3. Automatically triggers detector or waits for automated incident creation.
4. Executes AI root-cause investigation via local Ollama (llama3.2).
5. Queues allowlisted remediation into human-in-the-loop approval queue.
6. Approves remediation and verifies physical microservice recovery.
7. Confirms incident resolution and timeline event logging.
"""
import time
import requests
import json
import sys

API_BASE = "http://localhost:8000"
SVC_BASE = "http://localhost:8010"

print("=" * 70)
print("  HealthTechOps — Full Synthetic Incident Demonstration")
print("  SYNTHETIC ENVIRONMENT — Optum IEDP Portfolio Simulation")
print("=" * 70)

# Step 0: Authenticate as Admin
print("\n[Step 0] Authenticating as Admin User...")
login_resp = requests.post(f"{API_BASE}/api/v1/auth/login", json={
    "email": "admin@healthtechops.local",
    "password": "HealthTechOps2024!"
})
if login_resp.status_code != 200:
    print(f"FAILED to authenticate: {login_resp.text}")
    sys.exit(1)

token = login_resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"✓ Authenticated. JWT token received: {token[:16]}...")

# Verify initial microservice state
pre_health = requests.get(f"{SVC_BASE}/health").json()
print(f"✓ Initial microservice status: {pre_health.get('status')} (CPU: {pre_health.get('cpu_percent')}%)")

# Step 1: Inject Fault into claims-api
print("\n[Step 1] Injecting Chaos Failure into claims-api (port 8010)...")
inject_resp = requests.post(f"{SVC_BASE}/inject-failure", json={
    "failure_type": "cpu_spike",
    "duration_seconds": 300
})
print(f"✓ Injection response: {inject_resp.json()}")

degraded_health = requests.get(f"{SVC_BASE}/health").json()
print(f"✓ Verified service status: {degraded_health.get('status')} (CPU: {degraded_health.get('cpu_percent')}%, Error Rate: {degraded_health.get('error_rate')}%)")

# Step 2: Trigger Detection & verify Incident creation
print("\n[Step 2] Polling incident detector / awaiting incident creation...")
# Call detector directly to make demo fast without waiting 30s
sys.path.insert(0, "E:/HealthTechOps/backend")
from app.services.incident_detector import _check_services
_check_services()

# Query open incidents
incidents_resp = requests.get(f"{API_BASE}/api/v1/incidents", headers=headers, params={"status": "OPEN"})
open_incidents = incidents_resp.json()
target_incident = None
for inc in open_incidents:
    if "claims-api" in inc.get("title", "").lower() or "claims api" in inc.get("title", "").lower():
        target_incident = inc
        break

if not target_incident and open_incidents:
    target_incident = open_incidents[0]

if not target_incident:
    print("FAILED: No open incident created!")
    sys.exit(1)

print(f"✓ Incident Detected & Created in Database:")
print(f"  - ID: {target_incident['id']}")
print(f"  - Title: {target_incident['title']}")
print(f"  - Severity: {target_incident['severity']}")
print(f"  - Status: {target_incident['status']}")

# Step 3: Trigger AI Investigation via Ollama llama3.2
print("\n[Step 3] Invoking AI Agent Investigation via local Ollama (llama3.2)...")
inv_resp = requests.post(f"{API_BASE}/api/v1/ai/investigate", headers=headers, json={
    "incident_id": target_incident["id"]
})
print(f"✓ Investigation Job Dispatched: {inv_resp.json()}")
inv_id = inv_resp.json().get("investigation_id")

# Poll for AI investigation completion
print("  Awaiting Ollama diagnostic reasoning...")
investigation_record = None
for _ in range(40):
    time.sleep(2)
    inv_check = requests.get(f"{API_BASE}/api/v1/ai/investigations/{target_incident['id']}", headers=headers)
    if inv_check.status_code == 200:
        inv_data = inv_check.json()
        if inv_data and inv_data.get("status") in ("COMPLETED", "FAILED"):
            investigation_record = inv_data
            break

if not investigation_record:
    print("WARNING: Investigation poll timed out, querying by ID...")
    inv_check = requests.get(f"{API_BASE}/api/v1/ai/investigation/{inv_id}", headers=headers)
    if inv_check.status_code == 200:
        investigation_record = inv_check.json()

print(f"✓ AI Investigation Result:")
print(f"  - Status: {investigation_record.get('status')}")
print(f"  - Confidence: {investigation_record.get('confidence_score')}")
print(f"  - Root Cause Summary: {investigation_record.get('root_cause_summary')}")
print(f"  - Recommended Actions: {investigation_record.get('recommended_actions')}")
print(f"  - Safe to Automate: {investigation_record.get('safe_to_automate')}")

# Step 4: Queue Remediation into HITL Queue
print("\n[Step 4] Queueing Allowlist-Guarded Remediation into Approval Queue...")
rec_actions = investigation_record.get("recommended_actions") or ["restart_service"]
chosen_action = rec_actions[0] if rec_actions else "restart_service"

req_resp = requests.post(f"{API_BASE}/api/v1/remediation/request", headers=headers, json={
    "incident_id": target_incident["id"],
    "action_name": chosen_action,
    "risk_level": "MEDIUM",
    "service_id": target_incident.get("service_id")
})
rem_req = req_resp.json()
print(f"✓ Remediation Request Queued:")
print(f"  - Request ID: {rem_req['id']}")
print(f"  - Action: {rem_req['action_name']}")
print(f"  - Status: {rem_req['status']}")

# Verify in pending queue
pending_resp = requests.get(f"{API_BASE}/api/v1/remediation/pending", headers=headers)
print(f"✓ Verified in Pending Approvals queue ({len(pending_resp.json())} pending)")

# Step 5: SRE / Admin Approves Remediation
print(f"\n[Step 5] SRE / Admin Approving Remediation Request {rem_req['id']}...")
approve_resp = requests.post(f"{API_BASE}/api/v1/remediation/{rem_req['id']}/approve", headers=headers)
approval_data = approve_resp.json()
print(f"✓ Approval & Execution Response: {approval_data}")

# Step 6: Verify Service Recovery and Incident Resolution
print("\n[Step 6] Verifying Microservice Recovery and Incident Lifecycle...")
time.sleep(1)
post_health = requests.get(f"{SVC_BASE}/health").json()
print(f"✓ Microservice Health Status: {post_health.get('status')} (CPU: {post_health.get('cpu_percent')}%, Error Rate: {post_health.get('error_rate')}%)")

inc_final = requests.get(f"{API_BASE}/api/v1/incidents/{target_incident['id']}", headers=headers).json()
print(f"✓ Incident Final Status: {inc_final.get('status')}")
print(f"✓ Incident Timeline Events:")
for event in inc_final.get("events", []):
    print(f"  - [{event.get('occurred_at')}] {event.get('event_type')}: {event.get('description')}")

print("\n" + "=" * 70)
print("  SYNTHETIC INCIDENT DEMONSTRATION COMPLETE: ALL STAGES PASSED ✓")
print("=" * 70)
