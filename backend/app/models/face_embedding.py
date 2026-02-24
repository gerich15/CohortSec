"""Face embedding model for biometric auth (multiple faces per user)."""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class FaceEmbedding(Base):
    """Encrypted face embedding. Up to 5 per user."""

    __tablename__ = "face_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    encrypted_embedding = Column(Text, nullable=False)  # Fernet-encrypted JSON of 128-d vector
    label = Column(String(100), nullable=True)  # e.g. "с очками", "профиль"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="face_embeddings")
