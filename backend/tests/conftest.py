"""Pytest fixtures for backend tests."""

import os
import pytest
from fastapi.testclient import TestClient

# Use test database if available
os.environ.setdefault("POSTGRES_DB", "cohortsec_test")
os.environ.setdefault("POSTGRES_HOST", "localhost")
os.environ.setdefault("SECRET_KEY", "test-secret-key-min-32-chars-long")
os.environ.setdefault("CREATE_DEFAULT_ADMIN", "false")


@pytest.fixture
def client():
    """FastAPI test client."""
    from app.main import app
    return TestClient(app)
