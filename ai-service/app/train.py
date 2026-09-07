"""
Generates a synthetic (but realistically-correlated) transaction dataset,
trains a RandomForestClassifier fraud detector, and saves:
  - the trained model
  - the exact feature order it expects
  - per-feature mean/std for the "normal" class (used for lightweight,
    dependency-free explainability at inference time - see model.py)

Run: python app/train.py
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

RNG = np.random.default_rng(42)

FEATURES = [
    "amount",
    "hour_of_day",
    "is_new_device",
    "is_vpn_or_proxy",
    "distance_from_last_txn_km",
    "time_since_last_txn_min",
    "failed_logins_last_hour",
    "amount_to_avg_ratio",
    "country_changed",
    "device_trust_score",
]

N_LEGIT = 7000
N_FRAUD = 1300


def gen_legit(n):
    return pd.DataFrame(
        {
            "amount": RNG.lognormal(mean=6.5, sigma=0.9, size=n).clip(50, 40000),
            "hour_of_day": RNG.choice(range(24), size=n, p=_hour_weights(daytime_bias=True)),
            "is_new_device": RNG.binomial(1, 0.06, size=n),
            "is_vpn_or_proxy": RNG.binomial(1, 0.03, size=n),
            "distance_from_last_txn_km": RNG.exponential(scale=25, size=n).clip(0, 300),
            "time_since_last_txn_min": RNG.exponential(scale=800, size=n).clip(5, 20000),
            "failed_logins_last_hour": RNG.poisson(0.15, size=n).clip(0, 6),
            "amount_to_avg_ratio": RNG.normal(1.0, 0.35, size=n).clip(0.1, 3.5),
            "country_changed": RNG.binomial(1, 0.02, size=n),
            "device_trust_score": RNG.normal(78, 14, size=n).clip(20, 99),
            "label": 0,
        }
    )


def gen_fraud(n):
    return pd.DataFrame(
        {
            "amount": RNG.lognormal(mean=9.2, sigma=1.1, size=n).clip(500, 300000),
            "hour_of_day": RNG.choice(range(24), size=n, p=_hour_weights(daytime_bias=False)),
            "is_new_device": RNG.binomial(1, 0.72, size=n),
            "is_vpn_or_proxy": RNG.binomial(1, 0.55, size=n),
            "distance_from_last_txn_km": RNG.exponential(scale=2500, size=n).clip(0, 16000),
            "time_since_last_txn_min": RNG.exponential(scale=40, size=n).clip(1, 5000),
            "failed_logins_last_hour": RNG.poisson(1.8, size=n).clip(0, 10),
            "amount_to_avg_ratio": RNG.lognormal(mean=1.6, sigma=0.8, size=n).clip(1.5, 60),
            "country_changed": RNG.binomial(1, 0.6, size=n),
            "device_trust_score": RNG.normal(28, 15, size=n).clip(1, 70),
            "label": 1,
        }
    )


def _hour_weights(daytime_bias=True):
    hours = np.arange(24)
    if daytime_bias:
        w = np.exp(-0.5 * ((hours - 14) / 6) ** 2)  # peak ~2pm
    else:
        w = np.exp(-0.5 * ((hours - 3) / 5) ** 2) + 0.3  # late-night bias, but not exclusive
    return w / w.sum()


def _add_overlap_noise(df):
    # Real-world fraud/legit distributions overlap - a small fraction of
    # legit transactions look risky, and some fraud slips in close to
    # normal behaviour. Without this, the classifier looks unrealistically
    # perfect on a synthetic set.
    n = len(df)
    flip_legit = RNG.choice(df[df.label == 0].index, size=int(N_LEGIT * 0.04), replace=False)
    df.loc[flip_legit, "amount_to_avg_ratio"] *= RNG.uniform(2, 5, size=len(flip_legit))
    df.loc[flip_legit, "device_trust_score"] *= RNG.uniform(0.5, 0.8, size=len(flip_legit))

    flip_fraud = RNG.choice(df[df.label == 1].index, size=int(N_FRAUD * 0.10), replace=False)
    df.loc[flip_fraud, "amount_to_avg_ratio"] *= RNG.uniform(0.3, 0.6, size=len(flip_fraud))
    df.loc[flip_fraud, "device_trust_score"] = RNG.uniform(55, 80, size=len(flip_fraud))
    df.loc[flip_fraud, "distance_from_last_txn_km"] *= RNG.uniform(0.05, 0.2, size=len(flip_fraud))

    # Small gaussian jitter on every continuous feature
    for col in ["amount", "distance_from_last_txn_km", "time_since_last_txn_min", "amount_to_avg_ratio", "device_trust_score"]:
        df[col] = (df[col] * RNG.normal(1.0, 0.06, size=n)).clip(lower=0)
    return df


def main():
    df = pd.concat([gen_legit(N_LEGIT), gen_fraud(N_FRAUD)], ignore_index=True)
    df = _add_overlap_noise(df)

    # Irreducible label noise: even with perfect features, real fraud
    # labelling has some error (chargebacks disputed later, etc).
    flip_idx = RNG.choice(df.index, size=int(len(df) * 0.05), replace=False)
    df.loc[flip_idx, "label"] = 1 - df.loc[flip_idx, "label"]

    df = df.sample(frac=1, random_state=42).reset_index(drop=True)  # shuffle

    X = df[FEATURES]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=6,
        min_samples_leaf=8,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    preds = clf.predict(X_test)
    print(classification_report(y_test, preds, target_names=["legit", "fraud"]))

    normal_stats = {
        f: {"mean": float(df[df.label == 0][f].mean()), "std": float(df[df.label == 0][f].std() or 1.0)}
        for f in FEATURES
    }

    os.makedirs(os.path.join(os.path.dirname(__file__), "..", "models"), exist_ok=True)
    out_path = os.path.join(os.path.dirname(__file__), "..", "models", "fraud_model.pkl")
    joblib.dump(
        {
            "model": clf,
            "features": FEATURES,
            "normal_stats": normal_stats,
            "version": "rf-v1-synthetic",
        },
        out_path,
    )
    print(f"Saved model -> {out_path}")


if __name__ == "__main__":
    main()
