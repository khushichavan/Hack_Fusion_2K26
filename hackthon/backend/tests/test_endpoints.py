"""Unit tests for API endpoints using FastAPI TestClient."""

import json
import shutil
import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


@pytest.fixture(autouse=True)
def isolated_data_dir(tmp_path, monkeypatch):
    """Each test gets its own data directory to avoid side effects."""
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    monkeypatch.setattr("app.DATA_DIR", data_dir)
    monkeypatch.setattr("app.DB_FILE", data_dir / "smart_city_db.json")
    monkeypatch.setattr("app.frontend_state_file", data_dir / "frontend_state.json")
    # Re-create repository with clean state
    from app import MongoJsonRepository

    with patch.object(MongoJsonRepository, "__init__", lambda self: None):
        import app

        app.repo = MongoJsonRepository.__new__(MongoJsonRepository)
        app.repo.mongo = None
        app.repo.ensure_seed = lambda: None
        # Manually set up empty collections
        initial = {name: [] for name in app.COLLECTIONS}
        with open(data_dir / "smart_city_db.json", "w") as f:
            json.dump(initial, f)
        # Rebind internal methods
        app.repo._read_all = lambda: json.loads((data_dir / "smart_city_db.json").read_text())

        def _write_all(data):
            (data_dir / "smart_city_db.json").write_text(json.dumps(data, indent=2))

        app.repo._write_all = _write_all

        def _list(collection):
            return app.repo._read_all().get(collection, [])

        app.repo.list = _list

        def _replace(collection, docs):
            data = app.repo._read_all()
            data[collection] = docs
            app.repo._write_all(data)

        app.repo.replace = _replace

        def _insert(collection, doc):
            docs = app.repo.list(collection)
            docs.append(doc)
            app.repo.replace(collection, docs)

        app.repo.insert = _insert

        def _upsert(collection, key, value, doc):
            docs = app.repo.list(collection)
            updated = False
            for index, item in enumerate(docs):
                if item.get(key) == value:
                    docs[index] = {**item, **doc}
                    updated = True
                    break
            if not updated:
                docs.append(doc)
            app.repo.replace(collection, docs)

        app.repo.upsert = _upsert

    yield


@pytest.fixture
def client():
    from app import app

    return TestClient(app)


class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "AquaResolve AI"
        assert "timestamp" in data

    def test_root_endpoint(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["version"] == "2.0.0"
        assert "docs" in data


class TestSignupEndpoint:
    def test_signup_success(self, client):
        response = client.post("/signup", json={
            "username": "newuser",
            "email": "newuser@test.com",
            "password": "pass123",
            "role": "citizen",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "User registered successfully"
        assert data["user"]["email"] == "newuser@test.com"
        assert data["user"]["role"] == "citizen"
        assert "token" in data

    def test_signup_duplicate_user(self, client):
        payload = {
            "username": "dup",
            "email": "dup@test.com",
            "password": "pass",
            "role": "citizen",
        }
        client.post("/signup", json=payload)
        response = client.post("/signup", json=payload)
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()

    def test_signup_invalid_role(self, client):
        response = client.post("/signup", json={
            "username": "bad",
            "email": "bad@test.com",
            "password": "pass",
            "role": "superuser",
        })
        assert response.status_code == 400
        assert "role" in response.json()["detail"].lower()

    def test_signup_user_role_converted_to_citizen(self, client):
        response = client.post("/signup", json={
            "username": "citizen",
            "email": "citizen@test.com",
            "password": "pass",
            "role": "user",
        })
        assert response.status_code == 200
        assert response.json()["user"]["role"] == "citizen"

    def test_signup_invalid_email(self, client):
        response = client.post("/signup", json={
            "username": "bad",
            "email": "not-an-email",
            "password": "pass",
            "role": "citizen",
        })
        assert response.status_code == 422

    def test_auth_signup_alias(self, client):
        response = client.post("/auth/signup", json={
            "username": "authuser",
            "email": "authuser@test.com",
            "password": "pass",
            "role": "citizen",
        })
        assert response.status_code == 200
        assert response.json()["user"]["email"] == "authuser@test.com"


class TestLoginEndpoint:
    def test_login_success(self, client):
        client.post("/signup", json={
            "username": "loginuser",
            "email": "login@test.com",
            "password": "mypass",
            "role": "citizen",
        })
        response = client.post("/login", json={
            "email": "login@test.com",
            "password": "mypass",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Login successful"
        assert data["user"]["email"] == "login@test.com"
        assert "token" in data

    def test_login_wrong_password(self, client):
        client.post("/signup", json={
            "username": "u",
            "email": "u@test.com",
            "password": "correct",
            "role": "citizen",
        })
        response = client.post("/login", json={
            "email": "u@test.com",
            "password": "wrong",
        })
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        response = client.post("/login", json={
            "email": "nobody@test.com",
            "password": "pass",
        })
        assert response.status_code == 401

    def test_auth_login_alias(self, client):
        client.post("/signup", json={
            "username": "u2",
            "email": "u2@test.com",
            "password": "pw",
            "role": "citizen",
        })
        response = client.post("/auth/login", json={
            "email": "u2@test.com",
            "password": "pw",
        })
        assert response.status_code == 200


class TestWaterZonesEndpoint:
    def test_get_water_zones_empty(self, client):
        response = client.get("/water-zones")
        assert response.status_code == 200
        assert response.json()["zones"] == []

    def test_get_water_zones_with_data(self, client):
        from app import repo, zone as make_zone

        z = make_zone("z1", "Test", 28.0, 77.0, 100000, 1, 0.8, 0.1, 0.3, 0.7, 0.6)
        repo.insert("water_zones", z)
        response = client.get("/water-zones")
        assert response.status_code == 200
        zones = response.json()["zones"]
        assert len(zones) == 1
        assert zones[0]["id"] == "z1"


class TestComplaintsEndpoint:
    def test_create_complaint(self, client):
        response = client.post("/complaints", json={
            "user_email": "user@test.com",
            "zone_id": "zone-a",
            "category": "leakage",
            "description": "Water pipe leaking on main road",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Complaint submitted"
        complaint = data["complaint"]
        assert complaint["user_email"] == "user@test.com"
        assert complaint["zone_id"] == "zone-a"
        assert complaint["category"] == "leakage"
        assert complaint["status"] == "submitted"
        assert complaint["id"].startswith("cmp-")


class TestWaterRequestAction:
    def test_update_request_not_found(self, client):
        response = client.post("/water-requests/action", json={
            "request_id": "nonexistent",
            "action": "approved",
        })
        assert response.status_code == 404

    def test_update_request_success(self, client):
        from app import repo

        repo.insert("water_requests", {
            "id": "req-001",
            "zone_id": "zone-a",
            "user_email": "user@test.com",
            "amount": 100,
            "status": "pending",
            "priority": "high",
            "reason": "Need water",
            "created_at": "2024-01-01T00:00:00+00:00",
        })
        response = client.post("/water-requests/action", json={
            "request_id": "req-001",
            "action": "approved",
            "reason": "Emergency approved",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["request"]["status"] == "approved"
        assert data["request"]["decision_reason"] == "Emergency approved"


class TestTankerTracking:
    def test_get_tankers_empty(self, client):
        response = client.get("/tanker-tracking")
        assert response.status_code == 200
        assert response.json()["tankers"] == []

    def test_get_tankers_with_data(self, client):
        from app import repo

        repo.insert("tanker_tracking", {
            "id": "tanker-01",
            "driver": "Driver A",
            "lat": 28.5,
            "lng": 77.2,
            "capacity": 20,
            "status": "en route",
            "zone_id": "zone-a",
        })
        response = client.get("/tanker-tracking")
        assert response.status_code == 200
        tankers = response.json()["tankers"]
        assert len(tankers) == 1
        assert tankers[0]["driver"] == "Driver A"


class TestAuditLogs:
    def test_get_audit_logs_empty(self, client):
        response = client.get("/audit-logs")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["logs"] == []

    def test_audit_logs_limit(self, client):
        from app import repo

        for i in range(10):
            repo.insert("audit_logs", {"id": f"log-{i}", "action": f"action-{i}"})
        response = client.get("/audit-logs?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 10
        assert len(data["logs"]) == 5


class TestFrontendState:
    def test_get_frontend_state_empty(self, client):
        response = client.get("/frontend-state")
        assert response.status_code == 200
        assert response.json()["state"] is None

    def test_save_and_get_frontend_state(self, client):
        state = {"theme": "dark", "sidebar": True}
        response = client.put("/frontend-state", json={"state": state})
        assert response.status_code == 200
        assert "saved" in response.json()["message"].lower()

        response = client.get("/frontend-state")
        assert response.status_code == 200
        assert response.json()["state"] == state


class TestEmergencyTrigger:
    def test_trigger_emergency(self, client):
        from app import repo, zone as make_zone

        # Need zones for the fairness engine to work
        for z_id in ["zone-a", "zone-b", "zone-c"]:
            z = make_zone(z_id, f"Zone {z_id}", 28.0, 77.0, 100000, 1, 0.8, 0.1, 0.3, 0.7, 0.6)
            repo.insert("water_zones", z)

        response = client.post("/emergency/trigger", json={
            "event_type": "fire",
            "zone_id": "zone-a",
            "severity": "high",
            "notes": "Major fire in zone-a",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Emergency redistribution completed"
        assert data["event"]["event_type"] == "fire"
        assert data["event"]["zone_id"] == "zone-a"
        assert "allocation" in data


class TestAllocationEndpoint:
    def test_allocate(self, client):
        from app import repo, zone as make_zone

        for z_id in ["zone-a", "zone-b"]:
            z = make_zone(z_id, f"Zone {z_id}", 28.0, 77.0, 100000, 1, 0.8, 0.1, 0.3, 0.7, 0.6)
            repo.insert("water_zones", z)

        response = client.post("/ai/fairness/allocate", json={
            "total_supply": 1000,
            "drought_severity": 0.4,
        })
        assert response.status_code == 200
        data = response.json()
        assert "AI fairness allocation completed" in data["message"]
        result = data["result"]
        assert result["total_supply"] == 1000
        assert len(result["allocations"]) == 2
        # Total allocation should equal total supply
        total_allocated = sum(a["allocation_ml"] for a in result["allocations"])
        assert abs(total_allocated - 1000) < 0.1


class TestPredictions:
    def test_get_predictions(self, client):
        from app import repo, zone as make_zone

        # Need at least one zone for snapshot to work
        z = make_zone("zone-a", "Zone A", 28.0, 77.0, 100000, 1, 0.8, 0.1, 0.3, 0.7, 0.6)
        repo.insert("water_zones", z)

        response = client.get("/ai/predictions")
        assert response.status_code == 200
        data = response.json()
        assert "predictions" in data
        assert len(data["predictions"]) == 6
        assert all("day" in p and "demand" in p and "predicted" in p for p in data["predictions"])
