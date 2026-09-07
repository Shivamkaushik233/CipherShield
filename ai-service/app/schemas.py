from pydantic import BaseModel, Field
from typing import List


class TransactionFeatures(BaseModel):
    amount: float = Field(..., description="Transaction amount")
    hour_of_day: int = Field(..., ge=0, le=23)
    is_new_device: int = Field(0, ge=0, le=1)
    is_vpn_or_proxy: int = Field(0, ge=0, le=1)
    distance_from_last_txn_km: float = 0
    time_since_last_txn_min: float = 999999
    failed_logins_last_hour: int = 0
    amount_to_avg_ratio: float = 1.0
    country_changed: int = Field(0, ge=0, le=1)
    device_trust_score: float = 50


class PredictionResponse(BaseModel):
    riskScore: float
    confidence: float
    reasons: List[str]
    label: str
    modelVersion: str
