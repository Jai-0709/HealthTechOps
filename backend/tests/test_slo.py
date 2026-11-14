import pytest


def test_slo_overview(client, auth_headers):
    response = client.get("/api/v1/slo", headers=auth_headers)
    assert response.status_code == 200
    slos = response.json()
    assert len(slos) >= 6
    for s in slos:
        assert "service_name" in s
        assert "availability_target" in s
        assert "availability_actual" in s
        assert "error_budget_pct_remaining" in s
        assert 0.0 <= s["error_budget_pct_remaining"] <= 100.0
        assert "is_meeting_slo" in s
        assert isinstance(s["is_meeting_slo"], bool)


def test_slo_mttd_mttr(client, auth_headers):
    response = client.get("/api/v1/slo/mttd-mttr", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "mttd_minutes" in data
    assert "mttr_minutes" in data
    assert "total_resolved" in data
    assert "total_incidents" in data
    assert data["total_incidents"] >= data["total_resolved"]

