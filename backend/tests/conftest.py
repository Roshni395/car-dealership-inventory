import os
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-that-is-long-enough"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import User
from app.security import hash_password


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestingSession() as db:
        db.add(User(email="admin@example.com", full_name="Test Admin", password_hash=hash_password("AdminPass123!"), role="admin"))
        db.commit()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def customer_token(client):
    response = client.post("/api/auth/register", json={
        "email": "customer@example.com", "full_name": "Test Customer", "password": "CustomerPass123!"
    })
    assert response.status_code == 201
    login = client.post("/api/auth/login", json={"email": "customer@example.com", "password": "CustomerPass123!"})
    return login.json()["access_token"]


@pytest.fixture()
def admin_token(client):
    login = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "AdminPass123!"})
    return login.json()["access_token"]
