import os
import joblib
import numpy as np
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "fraud_model.pkl")

_bundle = None


def _load():
    global _bundle
    if _bundle is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. Run `python app/train.py` first."
            )
        _bundle = joblib.load(MODEL_PATH)
    return _bundle


# Human-readable reason templates. Each entry: (direction, template)
# direction "high" = flagged when value is ABOVE the normal mean, "low" = below.
REASON_TEMPLATES = {
    "amount": ("high", "Transaction amount is unusually large for this account"),
    "hour_of_day": ("high", "Transaction occurred at an unusual hour"),
    "is_new_device": ("high", "Initiated from a device never seen before on this account"),
    "is_vpn_or_proxy": ("high", "Connection is routed through a VPN or proxy"),
    "distance_from_last_txn_km": ("high", "Location is implausibly far from the previous transaction"),
    "time_since_last_txn_min": ("low", "Occurred suspiciously soon after the previous transaction"),
    "failed_logins_last_hour": ("high", "Multiple failed login attempts in the past hour"),
    "amount_to_avg_ratio": ("high", "Amount is far above this user's typical transaction size"),
    "country_changed": ("high", "Login country differs from the user's usual country"),
    "device_trust_score": ("low", "Originating device has an unusually low trust score"),
}


def _z_score(value, mean, std):
    return (value - mean) / (std if std else 1.0)


def _explain(features_dict, normal_stats, importances, feature_order, top_k=3):
    contributions = []
    for i, f in enumerate(feature_order):
        stats = normal_stats[f]
        z = _z_score(features_dict[f], stats["mean"], stats["std"])
        direction, template = REASON_TEMPLATES[f]
        # "risk-aligned" deviation: positive means this feature is pushing toward fraud
        risk_aligned_z = z if direction == "high" else -z
        contribution = max(risk_aligned_z, 0) * importances[i]
        contributions.append((contribution, template))

    contributions.sort(key=lambda x: x[0], reverse=True)
    top = [t for c, t in contributions if c > 0][:top_k]
    return top if top else ["No strong individual risk indicators - score reflects overall pattern"]


def predict(features_dict: dict):
    bundle = _load()
    model = bundle["model"]
    feature_order = bundle["features"]
    normal_stats = bundle["normal_stats"]
    version = bundle["version"]

    x = pd.DataFrame([[features_dict[f] for f in feature_order]], columns=feature_order)
    proba_fraud = float(model.predict_proba(x)[0][1])

    risk_score = round(proba_fraud * 100, 1)
    confidence = round(max(proba_fraud, 1 - proba_fraud), 2)

    if risk_score >= 85:
        label = "fraudulent"
    elif risk_score >= 55:
        label = "suspicious"
    else:
        label = "normal"

    if risk_score >= 30:
        reasons = _explain(features_dict, normal_stats, model.feature_importances_, feature_order)
    else:
        reasons = ["Transaction pattern is consistent with this user's normal behaviour"]

    return {
        "riskScore": risk_score,
        "confidence": confidence,
        "reasons": reasons,
        "label": label,
        "modelVersion": version,
    }
