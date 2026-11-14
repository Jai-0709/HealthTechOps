import pytest


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "HealthTechOps API"
    assert data["synthetic"] is True


def test_settings_health(client, auth_headers):
    response = client.get("/api/v1/settings/health", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

