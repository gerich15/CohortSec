"""AES-256-GCM symmetric encryption."""

from app.crypto.interfaces.encryption import SymmetricEncryptionInterface
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
import secrets


class AES256GCM(SymmetricEncryptionInterface):
    """AES-256-GCM implementation."""

    IV_SIZE = 12
    TAG_SIZE = 16
    KEY_SIZE = 32

    def encrypt(
        self, plaintext: bytes, key: bytes, associated_data: bytes | None = None
    ) -> tuple[bytes, bytes, bytes]:
        if len(key) != self.KEY_SIZE:
            key = HKDF(algorithm=hashes.SHA256(), length=self.KEY_SIZE, salt=None, info=b"aes-key").derive(key)
        aes = AESGCM(key)
        iv = secrets.token_bytes(self.IV_SIZE)
        ciphertext = aes.encrypt(iv, plaintext, associated_data or b"")
        return ciphertext[:-self.TAG_SIZE], iv, ciphertext[-self.TAG_SIZE:]

    def decrypt(
        self,
        ciphertext: bytes,
        key: bytes,
        iv: bytes,
        auth_tag: bytes,
        associated_data: bytes | None = None,
    ) -> bytes:
        if len(key) != self.KEY_SIZE:
            key = HKDF(algorithm=hashes.SHA256(), length=self.KEY_SIZE, salt=None, info=b"aes-key").derive(key)
        aes = AESGCM(key)
        return aes.decrypt(iv, ciphertext + auth_tag, associated_data or b"")

    def key_size(self) -> int:
        return self.KEY_SIZE
