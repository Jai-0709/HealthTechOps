import pytest


def test_admin_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@healthtechops.local", "password": "HealthTechOps2024!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "ADMIN"
    assert data["user"]["email"] == "admin@healthtechops.local"


def test_sre_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "sre@healthtechops.local", "password": "HealthTechOps2024!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "SRE_ENGINEER"


def test_viewer_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "viewer@healthtechops.local", "password": "HealthTechOps2024!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "VIEWER"


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@healthtechops.local", "password": "WrongPassword!"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_login_nonexistent_user(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@healthtechops.local", "password": "HealthTechOps2024!"},
    )
    assert response.status_code == 401


def test_unauthenticated_request_rejected(client):
    response = client.get("/api/v1/services")
    assert response.status_code == 401


def test_rbac_viewer_forbidden_from_admin_action(client, viewer_headers):
    # Remediation request requires ADMIN or SRE_ENGINEER
    response = client.post(
        "/api/v1/remediation/request",
        headers=viewer_headers,
        json={"action_name": "restart_service"},
    )
    assert response.status_code == 403

