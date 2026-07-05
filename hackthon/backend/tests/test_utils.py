"""Unit tests for utility functions in app.py."""

import re
from datetime import datetime, timezone

import pytest

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import hash_password, verify_password, uid, utc_now, demo_user, zone, public_user


class TestUtcNow:
    def test_returns_iso_format(self):
        result = utc_now()
        # Should be parseable as ISO format
        dt = datetime.fromisoformat(result)
        assert dt.tzinfo == timezone.utc

    def test_returns_current_time(self):
        before = datetime.now(timezone.utc)
        result = utc_now()
        after = datetime.now(timezone.utc)
        dt = datetime.fromisoformat(result)
        assert before <= dt <= after


class TestUid:
    def test_has_prefix(self):
        result = uid("test")
        assert result.startswith("test-")

    def test_unique_values(self):
        ids = {uid("x") for _ in range(100)}
        assert len(ids) == 100

    def test_hex_suffix(self):
        result = uid("pfx")
        suffix = result.split("-", 1)[1]
        assert re.match(r"^[0-9a-f]{8}$", suffix)


class TestHashPassword:
    def test_produces_salt_and_digest(self):
        hashed = hash_password("secret")
        assert "$" in hashed
        salt, digest = hashed.split("$")
        assert len(salt) == 32  # 16 bytes hex
        assert len(digest) == 64  # sha256 hex

    def test_different_salts(self):
        h1 = hash_password("same")
        h2 = hash_password("same")
        assert h1 != h2  # Different salts each time


class TestVerifyPassword:
    def test_correct_password(self):
        hashed = hash_password("mypassword")
        assert verify_password(hashed, "mypassword") is True

    def test_wrong_password(self):
        hashed = hash_password("correct")
        assert verify_password(hashed, "wrong") is False

    def test_invalid_hash_format(self):
        assert verify_password("nope", "anything") is False

    def test_empty_password(self):
        hashed = hash_password("")
        assert verify_password(hashed, "") is True
        assert verify_password(hashed, "notempty") is False


class TestDemoUser:
    def test_creates_user_dict(self):
        user = demo_user("Alice", "alice@example.com", "pass123", "citizen")
        assert user["username"] == "Alice"
        assert user["email"] == "alice@example.com"
        assert user["role"] == "citizen"
        assert user["id"].startswith("usr-")
        assert verify_password(user["password_hash"], "pass123")

    def test_citizen_reward_points(self):
        user = demo_user("Bob", "bob@test.com", "pw", "citizen")
        assert user["reward_points"] == 420

    def test_admin_reward_points(self):
        user = demo_user("Admin", "admin@test.com", "pw", "admin")
        assert user["reward_points"] == 0


class TestZone:
    def test_creates_zone_dict(self):
        z = zone("zone-x", "Test Zone", 28.5, 77.2, 100000, 2, 0.8, 0.1, 0.3, 0.7, 0.6)
        assert z["id"] == "zone-x"
        assert z["name"] == "Test Zone"
        assert z["lat"] == 28.5
        assert z["lng"] == 77.2
        assert z["population"] == 100000
        assert z["hospitals"] == 2
        assert z["demand_factor"] == 0.8
        assert z["wastage"] == 0.1
        assert z["low_income_index"] == 0.3
        assert z["past_usage"] == 0.7
        assert z["tank_level"] == 0.6

    def test_leakage_alert_low_tank(self):
        z = zone("z1", "Low Tank", 0, 0, 1000, 0, 0.5, 0.1, 0.2, 0.5, 0.4)
        assert z["leakage_alert"] is True

    def test_leakage_alert_high_wastage(self):
        z = zone("z2", "High Waste", 0, 0, 1000, 0, 0.5, 0.35, 0.2, 0.5, 0.9)
        assert z["leakage_alert"] is True

    def test_no_leakage_alert(self):
        z = zone("z3", "Good", 0, 0, 1000, 0, 0.5, 0.1, 0.2, 0.5, 0.9)
        assert z["leakage_alert"] is False

    def test_status_default_balanced(self):
        z = zone("z4", "Balanced", 0, 0, 1000, 0, 0.5, 0.1, 0.2, 0.5, 0.9)
        assert z["status"] == "balanced"


class TestPublicUser:
    def test_excludes_password(self):
        user = demo_user("Test", "t@t.com", "secret", "citizen")
        pub = public_user(user)
        assert "password_hash" not in pub
        assert "password" not in pub
        assert pub["email"] == "t@t.com"
        assert pub["username"] == "Test"
        assert pub["role"] == "citizen"
        assert "id" in pub
        assert "reward_points" in pub
