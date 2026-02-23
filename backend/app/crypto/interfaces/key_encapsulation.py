"""Interface for Key Encapsulation Mechanism (KEM)."""

from abc import ABC, abstractmethod
from typing import Tuple


class KEMInterface(ABC):
    """Interface for KEM algorithms (e.g. RSA-KEM, Kyber/ML-KEM)."""

    @abstractmethod
    def generate_keypair(self) -> Tuple[bytes, bytes]:
        """Generate (public_key, private_key)."""
        pass

    @abstractmethod
    def encapsulate(self, public_key: bytes) -> Tuple[bytes, bytes]:
        """Encapsulate shared secret. Returns (shared_secret, ciphertext)."""
        pass

    @abstractmethod
    def decapsulate(self, private_key: bytes, ciphertext: bytes) -> bytes:
        """Decapsulate shared secret from ciphertext."""
        pass

    @abstractmethod
    def algorithm_name(self) -> str:
        """Return algorithm identifier."""
        pass
