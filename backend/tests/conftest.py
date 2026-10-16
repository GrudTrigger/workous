import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app


@pytest.fixture
def client():
    """Каждый тест получает чистую БД SQLite в памяти."""
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
    # Без `with`, чтобы не запускать lifespan (он создаёт таблицы в основной БД)
    yield TestClient(app)
    app.dependency_overrides.clear()
    engine.dispose()


@pytest.fixture
def bench(client):
    return client.post("/api/exercises", json={"name": "Жим лёжа", "muscle_group": "Грудь"}).json()


@pytest.fixture
def squat(client):
    return client.post("/api/exercises", json={"name": "Присед", "muscle_group": "Ноги"}).json()
