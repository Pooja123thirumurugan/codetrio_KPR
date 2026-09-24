import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend root is on sys.path
TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(TESTS_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app
from app.api.deps import get_db
from app.database.base import Base
from app.database.session import SessionLocal, engine
from scripts.seed_data import seed_database


@pytest.fixture(scope="session")
def setup_test_db():
    """Ensure database schema is created and test seed data is present."""
    seed_database()
    yield
    # Cleanup if needed


@pytest.fixture(scope="function")
def db_session(setup_test_db):
    """Provides a transactional database session for a test function."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client(setup_test_db):
    """Provides a FastAPI test client with the test database."""
    with TestClient(app) as c:
        yield c
