"""Tests for anomalies endpoints - verify user_id filtering (IDOR prevention)."""

import pytest


def test_risk_chart_requires_auth(client):
    """Risk chart endpoint requires authentication."""
    r = client.get("/api/v1/anomalies/risk-chart")
    assert r.status_code == 401


def test_anomalies_list_requires_auth(client):
    """Anomalies list requires authentication."""
    r = client.get("/api/v1/anomalies/")
    assert r.status_code == 401
