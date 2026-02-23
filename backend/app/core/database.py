"""SQLAlchemy database session and base."""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Session:
    """Dependency for FastAPI: get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_migrations() -> None:
    """Run schema migrations for existing tables."""
    from sqlalchemy import text

    migrations = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free'",
        "ALTER TABLE fraud_reports ADD COLUMN IF NOT EXISTS attachment_paths JSON",
    ]
    for sql in migrations:
        try:
            with engine.begin() as conn:
                conn.execute(text(sql))
        except Exception as e:
            if "already exists" not in str(e).lower() and "does not exist" not in str(e).lower():
                raise


def init_db() -> None:
    """Create all tables. Call on startup."""
    from app.models import (  # noqa: F401
        Anomaly,
        BackupConfig,
        BackupLog,
        BreachedPassword,
        EncryptedData,
        FamilyInvitation,
        FamilyMember,
        KeyVersion,
        OnboardingStatus,
        PasswordCheckLog,
        SimpleBackupConfig,
        FraudReport,
        SupportMessage,
        SupportTicket,
        User,
        UserAction,
        UserSession,
    )

    Base.metadata.create_all(bind=engine)
    run_migrations()
