import pytest


def test_remediation_lifecycle(client, auth_headers):
    # 1. Create request
    incidents = client.get("/api/v1/incidents", headers=auth_headers).json()
    inc_id = incidents[0]["id"]
    req_body = {
        "incident_id": inc_id,
        "action_name": "clear_cache",
        "risk_level": "LOW",
    }
    create_resp = client.post("/api/v1/remediation/request", headers=auth_headers, json=req_body)
    assert create_resp.status_code == 200
    req_data = create_resp.json()
    req_id = req_data["id"]
    assert req_data["status"] == "PENDING"
    assert req_data["action_name"] == "clear_cache"

    # 2. Check it appears in pending
    pending = client.get("/api/v1/remediation/pending", headers=auth_headers).json()
    assert any(p["id"] == req_id for p in pending)

    # 3. Approve it
    approve_resp = client.post(f"/api/v1/remediation/{req_id}/approve", headers=auth_headers)
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "COMPLETED"

    # 4. Check it is no longer pending
    pending_after = client.get("/api/v1/remediation/pending", headers=auth_headers).json()
    assert not any(p["id"] == req_id for p in pending_after)


def test_remediation_rejection(client, auth_headers):
    # 1. Create request
    req_body = {
        "action_name": "rollback_deployment",
        "risk_level": "HIGH",
    }
    create_resp = client.post("/api/v1/remediation/request", headers=auth_headers, json=req_body)
    assert create_resp.status_code == 200
    req_id = create_resp.json()["id"]

    # 2. Reject it
    reject_resp = client.post(f"/api/v1/remediation/{req_id}/reject", headers=auth_headers)
    assert reject_resp.status_code == 200
    assert reject_resp.json()["status"] == "REJECTED"


def test_remediation_not_found(client, auth_headers):
    resp = client.post("/api/v1/remediation/fake-nonexistent-id/approve", headers=auth_headers)
    assert resp.status_code == 404

