from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_PATH = (BASE_DIR / "healthtechops.db").as_posix()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "HealthTechOps"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_PATH}"

    SIMULATOR_HOST: str = "localhost"

    JWT_SECRET_KEY: str = "supersecretkey-change-in-production-healthtechops2024"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    INCIDENT_DETECTION_INTERVAL_SECONDS: int = 30
    MONITORING_INTERVAL_SECONDS: int = 15

    SYNTHETIC_SERVICES: list[str] = [
        "claims-api:8010",
        "provider-portal:8011",
        "pharmacy-service:8012",
        "identity-service:8013",
        "notification-service:8014",
        "database-service:8015",
    ]


settings = Settings()
