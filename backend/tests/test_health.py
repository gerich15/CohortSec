"""Tests for health endpoint."""

import pytest


def test_health_returns_200(client):
    """Health endpoint returns 200 and status structure."""
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert "status" in data
    assert "checks" in data
    assert "db" in data["checks"]
    assert "redis" in data["checks"]
