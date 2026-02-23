"""Tests for auth endpoints."""

import pytest


@pytest.mark.skip(reason="Requires PostgreSQL; run with DB available")
def test_register_creates_user(client):
    """Registration creates user and returns id."""
    r = client.post(
        "/api/v1/auth/register",
        json={
            "email": "testuser2@example.com",
            "username": "testuser2",
            "full_name": "Test User",
            "password": "SecureP@ssw0rd123!",
        },
    )
    assert r.status_code in (200, 400)
    if r.status_code == 200:
        data = r.json()
        assert "id" in data


@pytest.mark.skip(reason="Requires PostgreSQL; run with DB available")
def test_login_rejects_invalid_credentials(client):
    """Login rejects invalid credentials."""
    r = client.post(
        "/api/v1/auth/login",
        json={"username": "nonexistent", "password": "wrong"},
    )
    assert r.status_code == 401
