from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import exercises, stats, workouts


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Для учебного проекта таблицы создаются при старте.
    # В реальном проекте здесь были бы миграции (Alembic).
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title=settings.app_name, version=settings.app_version, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(exercises.router)
app.include_router(workouts.router)
app.include_router(stats.router)


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok", "version": settings.app_version}
