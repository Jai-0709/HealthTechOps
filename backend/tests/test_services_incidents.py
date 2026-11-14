import pytest


def test_get_overview(client, auth_headers):
    response = client.get("/api/v1/overview", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "services" in data
    assert "incidents" in data
    assert "system_health" in data
    assert data["services"]["total"] >= 6


def test_list_services(client, auth_headers):
    response = client.get("/api/v1/services", headers=auth_headers)
    assert response.status_code == 200
    services = response.json()
    assert len(services) >= 6
    assert any(s["slug"] == "claims-api" for s in services)


def test_get_service_detail(client, auth_headers):
    response = client.get("/api/v1/services/claims-api", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "claims-api"
    assert "name" in data


def test_get_nonexistent_service(client, auth_headers):
    response = client.get("/api/v1/services/nonexistent-service-123", headers=auth_headers)
    assert response.status_code == 404


def test_list_incidents(client, auth_headers):
    response = client.get("/api/v1/incidents", headers=auth_headers)
    assert response.status_code == 200
    incidents = response.json()
    assert len(incidents) >= 1
    first = incidents[0]
    assert "id" in first
    assert "title" in first
    assert "severity" in first
    assert "status" in first


def test_get_incident_detail(client, auth_headers):
    incidents = client.get("/api/v1/incidents", headers=auth_headers).json()
    target_id = incidents[0]["id"]
    response = client.get(f"/api/v1/incidents/{target_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == target_id
    assert "events" in data


def test_update_incident_status(client, auth_headers):
    incidents = client.get("/api/v1/incidents", headers=auth_headers).json()
    target = incidents[0]
    new_status = "INVESTIGATING" if target["status"] != "INVESTIGATING" else "ACKNOWLEDGED"
    response = client.patch(
        f"/api/v1/incidents/{target['id']}",
        headers=auth_headers,
        json={"status": new_status},
    )
    assert response.status_code == 200
    assert response.json()["status"] == new_status


def test_infrastructure_metrics(client, auth_headers):
    response = client.get("/api/v1/infrastructure/metrics", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "cpu" in data
    assert "memory" in data
    assert "processes" in data


def test_observability_metrics_and_logs(client, auth_headers):
    m_resp = client.get("/api/v1/observability/metrics", headers=auth_headers)
    assert m_resp.status_code == 200
    assert "service_metrics" in m_resp.json()

    l_resp = client.get("/api/v1/observability/logs", headers=auth_headers)
    assert l_resp.status_code == 200
    assert "logs" in l_resp.json()


def test_runbooks_list(client, auth_headers):
    response = client.get("/api/v1/runbooks", headers=auth_headers)
    assert response.status_code == 200
    runbooks = response.json()
    assert len(runbooks) >= 4
