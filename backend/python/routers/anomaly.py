from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

class PricePoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class AnomalyRequest(BaseModel):
    ticker: str
    prices: List[PricePoint]

@router.post("/anomaly")
async def get_anomalies(body: AnomalyRequest):
    if not body.prices:
        raise HTTPException(status_code=400, detail="No prices provided")

    try:
        from services.anomaly_engine import detect_Anomalies
        prices_list = [p.dict() for p in body.prices]
        anomalies = detect_Anomalies(prices_list)
    except Exception as e:
        print("Anomaly error:", str(e))
        anomalies = []

    return {
        "ticker": body.ticker,
        "total_days_analyzed": len(body.prices),
        "anomalies_found": len(anomalies),
        "anomalies": anomalies
    }