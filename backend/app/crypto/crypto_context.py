"""Crypto context."""
from typing import Any

class CryptoContext:
    DEFAULT_POLICY={"default_kem":"X25519","default_encryption":"AES-256-GCM","default_signature":"ECDSA","long_term_kem":"ML-KEM-768","session_kem":"HYBRID-X25519-MLKEM","long_term_sig":"ML-DSA-65","hybrid_sig":"HYBRID-ECDSA-MLDSA"}
    def __init__(self,policy_name="default"):
        self.policy_name=policy_name
        self.policy=dict(self.DEFAULT_POLICY)
    def get_kem_algorithm(self,purpose="long_term_storage"):
        if purpose=="long_term_storage":return self.policy.get("long_term_kem","ML-KEM-768")
        if purpose=="session":return self.policy.get("session_kem","HYBRID-X25519-MLKEM")
        return self.policy.get("default_kem","X25519")
    def get_signature_algorithm(self,purpose="user_auth"):
        if purpose=="long_term_contract":return self.policy.get("long_term_sig","ML-DSA-65")
        return self.policy.get("hybrid_sig","ECDSA")
    def get_encryption_algorithm(self,purpose="data_at_rest"):
        return self.policy.get("default_encryption","AES-256-GCM")
