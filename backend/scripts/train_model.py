#!/usr/bin/env python3
"""Train ML model for anomaly detection. Run once on first deploy."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.predictor import train_model, _generate_synthetic_data

if __name__ == "__main__":
    data = _generate_synthetic_data()
    model = train_model(data)
    if model:
        print("Model trained and saved to ml_models/anomaly_predictor.pkl")
    else:
        print("Failed to train model")
        sys.exit(1)
