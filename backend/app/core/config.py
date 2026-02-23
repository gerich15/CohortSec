"""Pydantic settings for application configuration."""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    project_name: str = "CohortSec - Platform Predictive Data Protection"
    api_v1_prefix: str = Field(default="/api/v1", alias="API_V1_PREFIX")
    frontend_base_url: str = Field(
        default="http://localhost:3000",
        alias="FRONTEND_BASE_URL",
        description="Base URL of frontend for invite/email links.",
    )
    debug: bool = Field(default=False, alias="DEBUG")
    create_default_admin: bool = Field(
        default=False,
        alias="CREATE_DEFAULT_ADMIN",
        description="If True, create admin/admin when no users exist. NEVER enable in production.",
    )

    # Database
    postgres_host: str = Field(default="localhost", alias="POSTGRES_HOST")
    postgres_port: int = Field(default=5432, alias="POSTGRES_PORT")
    postgres_user: str = Field(default="cohortsec", alias="POSTGRES_USER")
    postgres_password: str = Field(default="", alias="POSTGRES_PASSWORD")
    postgres_db: str = Field(default="cohortsec_db", alias="POSTGRES_DB")

    @property
    def database_url(self) -> str:
        """Synchronous database URL for SQLAlchemy."""
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def async_database_url(self) -> str:
        """Async database URL (asyncpg)."""
        return (
            f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    # Redis
    redis_host: str = Field(default="localhost", alias="REDIS_HOST")
    redis_port: int = Field(default=6379, alias="REDIS_PORT")
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")

    # JWT
    secret_key: str = Field(
        default="change-me-in-production-min-32-chars",
        alias="SECRET_KEY",
    )
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=15,
        alias="ACCESS_TOKEN_EXPIRE_MINUTES",
    )
    refresh_token_expire_days: int = Field(
        default=7,
        alias="REFRESH_TOKEN_EXPIRE_DAYS",
    )
    token_cookie_domain: str = Field(default="", alias="TOKEN_COOKIE_DOMAIN")
    token_cookie_secure: bool = Field(default=False, alias="TOKEN_COOKIE_SECURE")

    # Encryption (Fernet for biometric templates)
    encryption_key: str = Field(default="", alias="ENCRYPTION_KEY")

    # CORS (env: comma-separated string, e.g. "http://localhost:3000,http://192.168.1.63:3000")
    allowed_origins_env: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        alias="ALLOWED_ORIGINS",
    )

    @property
    def allowed_origins(self) -> List[str]:
        """Parse comma-separated origins."""
        s = (self.allowed_origins_env or "").strip()
        return [x.strip() for x in s.split(",") if x.strip()] or [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]

    # MinIO / S3
    minio_endpoint: str = Field(default="localhost:9000", alias="MINIO_ENDPOINT")
    minio_access_key: str = Field(default="minioadmin", alias="MINIO_ACCESS_KEY")
    minio_secret_key: str = Field(default="minioadmin", alias="MINIO_SECRET_KEY")
    minio_bucket: str = Field(default="cohortsec-backups", alias="MINIO_BUCKET")
    minio_secure: bool = Field(default=False, alias="MINIO_SECURE")

    # reCAPTCHA (fraud report form)
    recaptcha_site_key: str = Field(default="", alias="RECAPTCHA_SITE_KEY")
    recaptcha_secret_key: str = Field(default="", alias="RECAPTCHA_SECRET_KEY")

    # SMTP (email notifications)
    smtp_host: str = Field(default="", alias="SMTP_HOST")
    smtp_port: int = Field(default=587, alias="SMTP_PORT")
    smtp_user: str = Field(default="", alias="SMTP_USER")
    smtp_password: str = Field(default="", alias="SMTP_PASSWORD")
    smtp_from: str = Field(default="noreply@cohortsec.example", alias="SMTP_FROM")
    smtp_admin_email: str = Field(default="admin@cohortsec.example", alias="SMTP_ADMIN_EMAIL")

    # Uploads
    upload_dir: str = Field(default="uploads", alias="UPLOAD_DIR")

    # ClamAV (optional antivirus scan for uploads)
    clamav_enabled: bool = Field(default=False, alias="CLAMAV_ENABLED")

    # Keycloak (optional SSO)
    keycloak_url: str = Field(default="http://localhost:8080", alias="KEYCLOAK_URL")
    keycloak_realm: str = Field(default="cohortsec", alias="KEYCLOAK_REALM")
    keycloak_client_id: str = Field(
        default="cohortsec-frontend",
        alias="KEYCLOAK_CLIENT_ID",
    )
    keycloak_client_secret: str = Field(
        default="",
        alias="KEYCLOAK_CLIENT_SECRET",
    )


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
