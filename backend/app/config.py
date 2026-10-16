from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Настройки читаются из переменных окружения (или файла .env)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Workout Tracker API"
    app_version: str = "0.1.0"
    database_url: str = "sqlite:///./workouts.db"
    # Список origin'ов через запятую, например: http://localhost:5173,http://localhost:8080
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
