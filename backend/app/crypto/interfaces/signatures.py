"""Interface for digital signatures."""

from abc import ABC, abstractmethod
from typing import Tuple


class SignatureInterface(ABC):
    """Interface for signature algorithms (e.g. ECDSA, Dilithium/ML-DSA)."""

    @abstractmethod
    def generate_keypair(self) -> Tuple[bytes, bytes]:
        """Generate (public_key, private_key)."""
        pass

    @abstractmethod
    def sign(self, message: bytes, private_key: bytes) -> bytes:
        """Sign message."""
        pass

    @abstractmethod
    def verify(self, message: bytes, signature: bytes, public_key: bytes) -> bool:
        """Verify signature."""
        pass

    @abstractmethod
    def algorithm_name(self) -> str:
        """Return algorithm identifier."""
        pass
