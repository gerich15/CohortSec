"""Interface for symmetric encryption."""

from abc import ABC, abstractmethod
from typing import Tuple


class SymmetricEncryptionInterface(ABC):
    """Interface for symmetric encryption (e.g. AES-GCM, ChaCha20-Poly1305)."""

    @abstractmethod
    def encrypt(self, plaintext: bytes, key: bytes, associated_data: bytes | None = None) -> Tuple[bytes, bytes, bytes]:
        """Encrypt plaintext. Returns (ciphertext, iv/nonce, auth_tag)."""
        pass

    @abstractmethod
    def decrypt(
        self, ciphertext: bytes, key: bytes, iv: bytes, auth_tag: bytes, associated_data: bytes | None = None
    ) -> bytes:
        """Decrypt ciphertext."""
        pass

    @abstractmethod
    def key_size(self) -> int:
        """Return required key size in bytes."""
        pass
