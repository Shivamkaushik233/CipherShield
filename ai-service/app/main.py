from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import TransactionFeatures, PredictionResponse
from . import model as model_module

app = FastAPI(title="CipherShield AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ciphershield-ai-service"}


@app.post("/predict", response_model=PredictionResponse)
def predict(features: TransactionFeatures):
    try:
        result = model_module.predict(features.model_dump())
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")
