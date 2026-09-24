import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    PROJECT_NAME: str = "SLA Guardian AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # Database: Default to SQLite fallback if PostgreSQL is not running locally
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./sla_guardian.db"
    )

    # Gemini AI Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

    # Machine Learning Artifacts Path
    MODEL_PATH: str = os.getenv(
        "MODEL_PATH",
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "artifacts")
    )

    # Operational Thresholds
    DEFAULT_PRE_BREACH_BUFFER_MINUTES: int = 20
    DEFAULT_PREVENTIVE_THRESHOLD: float = 0.75
    SLA_ESCALATION_BUFFER_MINUTES: int = 20
    SLA_BREACH_RISK_THRESHOLD: float = 0.75
    CRITICAL_RISK_THRESHOLD: float = 0.80
    HIGH_RISK_THRESHOLD: float = 0.65
    MEDIUM_RISK_THRESHOLD: float = 0.40

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()
    ] if os.getenv("CORS_ORIGINS") else [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://localhost:80",
        "http://localhost:8000",
        "http://localhost",
    ]

settings = Settings()

