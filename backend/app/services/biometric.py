"""Face recognition / biometric authentication service.

Uses face_recognition (dlib) when available. Fallback: placeholder comparison.
Templates stored encrypted with Fernet (AES-256).
"""

import base64
import json
import logging
from io import BytesIO
from typing import List, Optional, Tuple

from PIL import Image

from app.core.security import create_fernet, decrypt_data, encrypt_data

logger = logging.getLogger(__name__)

# Optional face_recognition - graceful fallback if not installed
try:
    import face_recognition

    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    logger.warning("face_recognition not installed. Biometric auth will use placeholder.")


SIMILARITY_THRESHOLD = 0.65
MIN_IMAGE_WIDTH = 100
MIN_IMAGE_HEIGHT = 100
MIN_FACE_PIXELS = 2500  # ~50x50


def check_image_quality(image_bytes: bytes) -> Tuple[bool, str]:
    """Check if image is suitable for face recognition.
    Returns (ok, message).
    """
    try:
        img = Image.open(BytesIO(image_bytes))
        w, h = img.size
        if w < MIN_IMAGE_WIDTH or h < MIN_IMAGE_HEIGHT:
            return False, f"Изображение слишком маленькое (минимум {MIN_IMAGE_WIDTH}x{MIN_IMAGE_HEIGHT} px)"
        if w > 4096 or h > 4096:
            return False, "Изображение слишком большое"
        if not FACE_RECOGNITION_AVAILABLE:
            return True, "ok"
        image = face_recognition.load_image_file(BytesIO(image_bytes))
        face_locations = face_recognition.face_locations(image)
        if not face_locations:
            return False, "Лицо не обнаружено. Сфотографируйте лицо анфас при хорошем освещении."
        if len(face_locations) > 1:
            return False, "Обнаружено несколько лиц. Сфотографируйте только одно лицо."
        top, right, bottom, left = face_locations[0]
        face_area = (bottom - top) * (right - left)
        if face_area < MIN_FACE_PIXELS:
            return False, "Лицо слишком маленькое на фото. Подойдите ближе или используйте фото с большим разрешением."
        return True, "ok"
    except Exception as e:
        logger.exception("Image quality check failed: %s", e)
        return False, "Не удалось обработать изображение"


def _encode_embedding(embedding: List[float]) -> bytes:
    """Serialize embedding to bytes."""
    return json.dumps(embedding).encode("utf-8")


def _decode_embedding(data: bytes) -> List[float]:
    """Deserialize embedding from bytes."""
    return json.loads(data.decode("utf-8"))


def extract_face_embedding(image_bytes: bytes) -> Optional[List[float]]:
    """Extract 128-d face embedding from image.

    Returns None if no face found or face_recognition not available.
    """
    if not FACE_RECOGNITION_AVAILABLE:
        # Placeholder: generate pseudo-embedding from image hash
        import hashlib

        h = hashlib.sha256(image_bytes).hexdigest()
        return [float((int(h[i : i + 2], 16) - 128) / 128) for i in range(0, 32, 2)] * 4

    try:
        image = face_recognition.load_image_file(BytesIO(image_bytes))
        encodings = face_recognition.face_encodings(image)
        if encodings:
            return list(encodings[0])
    except Exception as e:
        logger.exception("Face encoding failed: %s", e)
    return None


def compare_faces(
    embedding1: List[float], embedding2: List[float], threshold: float = SIMILARITY_THRESHOLD
) -> Tuple[bool, float]:
    """Compare two face embeddings. Returns (match, distance)."""
    if not FACE_RECOGNITION_AVAILABLE:
        # Placeholder: compare by L2 distance
        import math

        dist = math.sqrt(sum((a - b) ** 2 for a, b in zip(embedding1, embedding2)))
        match = dist < (1 - threshold)
        return match, float(dist)

    try:
        distance = face_recognition.face_distance([embedding1], embedding2)[0]
        match = distance < (1 - threshold)
        return match, float(distance)
    except Exception as e:
        logger.exception("Face comparison failed: %s", e)
        return False, 1.0


def encrypt_embedding(embedding: List[float]) -> Optional[str]:
    """Encrypt embedding and return base64 string for storage."""
    data = _encode_embedding(embedding)
    encrypted = encrypt_data(data)
    if encrypted:
        return base64.b64encode(encrypted).decode("ascii")
    return None


def decrypt_embedding(encrypted_b64: str) -> Optional[List[float]]:
    """Decrypt stored embedding."""
    try:
        encrypted = base64.b64decode(encrypted_b64.encode("ascii"))
        data = decrypt_data(encrypted)
        if data:
            return _decode_embedding(data)
    except Exception as e:
        logger.exception("Decrypt embedding failed: %s", e)
    return None


def verify_face(
    new_image_bytes: bytes,
    stored_encrypted_b64: str,
    threshold: float = SIMILARITY_THRESHOLD,
) -> bool:
    """Verify face against stored template. Returns True if match."""
    new_embedding = extract_face_embedding(new_image_bytes)
    if not new_embedding:
        return False

    stored_embedding = decrypt_embedding(stored_encrypted_b64)
    if not stored_embedding:
        return False

    match, _ = compare_faces(stored_embedding, new_embedding, threshold)
    return match
