"""ML anomaly prediction - Isolation Forest on user behavior."""

import logging
import os
from pathlib import Path
from typing import List, Optional, Tuple

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

ML_MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "ml_models"
MODEL_PATH = ML_MODELS_DIR / "anomaly_predictor.pkl"


def _ensure_models_dir() -> Path:
    """Ensure ml_models directory exists."""
    ML_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    return ML_MODELS_DIR


def get_features(
    hour: int,
    weekday: int,
    volume_ops: int,
    geo_hash: Optional[str] = None,
    ip_hash: Optional[str] = None,
) -> np.ndarray:
    """Convert action features to numpy array for model."""
    geo_val = hash(geo_hash or "unknown") % 1000
    ip_val = hash(ip_hash or "0") % 1000
    return np.array(
        [[hour, weekday, volume_ops, geo_val, ip_val]],
        dtype=np.float64,
    )


def train_model(samples: List[List[float]]) -> Optional[IsolationForest]:
    """Train Isolation Forest on historical data.

    samples: list of [hour, weekday, volume_ops, geo_hash_val, ip_hash_val]
    """
    if len(samples) < 10:
        logger.warning("Not enough samples to train. Need at least 10.")
        return None

    X = np.array(samples, dtype=np.float64)
    model = IsolationForest(
        contamination=0.1,
        random_state=42,
        n_estimators=100,
    )
    model.fit(X)
    _ensure_models_dir()
    joblib.dump(model, MODEL_PATH)
    logger.info("Model trained and saved to %s", MODEL_PATH)
    return model


def load_model() -> Optional[IsolationForest]:
    """Load trained model from disk."""
    if not MODEL_PATH.exists():
        return None
    try:
        return joblib.load(MODEL_PATH)
    except Exception as e:
        logger.exception("Failed to load model: %s", e)
        return None


def predict(
    hour: int,
    weekday: int,
    volume_ops: int,
    geo_hash: Optional[str] = None,
    ip_hash: Optional[str] = None,
) -> Tuple[int, float]:
    """Predict if action is anomaly.

    Returns: (prediction, score)
    - prediction: -1 = anomaly, 1 = normal
    - score: anomaly score (lower = more anomalous)
    """
    model = load_model()
    if model is None:
        # No model: create and train on minimal synthetic data
        synthetic = _generate_synthetic_data()
        model = train_model(synthetic)
        if model is None:
            return 1, 0.0  # Default to normal if training fails

    features = get_features(hour, weekday, volume_ops, geo_hash, ip_hash)
    pred = model.predict(features)[0]
    score = model.decision_function(features)[0]
    return int(pred), float(score)


def _generate_synthetic_data() -> List[List[float]]:
    """Generate synthetic user action data for initial model training."""
    np.random.seed(42)
    samples = []
    # Normal behavior: 9-18 hour, 0-4 weekday, low volume
    for _ in range(100):
        hour = int(np.random.normal(13, 3))
        hour = max(0, min(23, hour))
        weekday = int(np.random.choice([0, 1, 2, 3, 4]))  # Mon-Fri
        volume = int(np.random.exponential(5))
        geo = float(np.random.randint(0, 1000))
        ip = float(np.random.randint(0, 1000))
        samples.append([hour, weekday, volume, geo, ip])
    return samples
