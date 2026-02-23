"""Key manager with versioning and rotation."""

from datetime import datetime, timedelta
from typing import Any, Optional
import secrets
import uuid

from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey
from cryptography.hazmat.primitives import serialization


class KeyManager:
    """Manage keys with versioning and rotation."""

    def __init__(self) -> None:
        self._keys: dict[str, dict[str, Any]] = {}
        self._current_versions: dict[str, str] = {}

    def _generate_key_id(self) -> str:
        return f"key_{uuid.uuid4().hex[:16]}"

    def generate_key(
        self, algorithm: str, purpose: str, expiry_days: int = 365
    ) -> str:
        """Generate a new key for the given algorithm and purpose."""
        key_id = self._generate_key_id()
        key_material: bytes | None = None

        if algorithm in ("X25519", "HYBRID-X25519-MLKEM"):
            priv = X25519PrivateKey.generate()
            key_material = priv.private_bytes(
                serialization.Encoding.Raw,
                serialization.PrivateFormat.Raw,
                serialization.NoEncryption(),
            )
        else:
            key_material = secrets.token_bytes(32)

        created = datetime.utcnow()
        expires = created + timedelta(days=expiry_days)

        self._keys[key_id] = {
            "key": key_material,
            "algorithm": algorithm,
            "purpose": purpose,
            "created_at": created,
            "expires_at": expires,
            "archived": False,
        }
        self._current_versions[purpose] = key_id
        return key_id

    def get_key_for_purpose(self, purpose: str, version: str = "current") -> Optional[dict[str, Any]]:
        """Get key for the given purpose."""
        key_id = self._current_versions.get(purpose)
        if not key_id:
            return None
        return self._keys.get(key_id)

    def rotate_key(
        self, purpose: str, new_algorithm: Optional[str] = None
    ) -> dict[str, Any]:
        """Rotate key for the given purpose."""
        old_key_id = self._current_versions.get(purpose)
        old_key = self._keys.get(old_key_id, {}) if old_key_id else {}
        new_algorithm = new_algorithm or old_key.get("algorithm", "X25519")

        new_key_id = self.generate_key(new_algorithm, purpose)

        if old_key_id and old_key_id in self._keys:
            self._keys[old_key_id]["archived"] = True
            self._keys[old_key_id]["archived_at"] = datetime.utcnow()

        return {
            "old_key_id": old_key_id,
            "new_key_id": new_key_id,
            "algorithm_changed": new_algorithm != old_key.get("algorithm"),
        }
