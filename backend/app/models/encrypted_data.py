"""Models for encrypted data with metadata (crypto-agility)."""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, LargeBinary, String

from app.core.database import Base


class EncryptedData(Base):
    """Stores encrypted data with metadata for algorithm agility."""

    __tablename__ = "encrypted_data"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    data_type = Column(String(100))  # password_hash, backup_key, personal_data

    encryption_algorithm = Column(String(50))
    key_encapsulation_algorithm = Column(String(50), nullable=True)
    key_id = Column(String(100), nullable=True)
    key_version = Column(Integer, nullable=True)

    ciphertext = Column(LargeBinary, nullable=False)
    iv = Column(LargeBinary, nullable=False)
    auth_tag = Column(LargeBinary, nullable=True)
    encapsulated_key = Column(LargeBinary, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    algorithm_version = Column(String(20), nullable=True)


class KeyVersion(Base):
    """Key versioning for crypto rotation."""

    __tablename__ = "key_versions"

    id = Column(Integer, primary_key=True, index=True)
    algorithm = Column(String(50), nullable=False)
    purpose = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Integer, default=1)
