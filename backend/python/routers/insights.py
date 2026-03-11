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

class InsightRequest(BaseModel):
    ticker: str
    prices: List[PricePoint]

@router.post("/insights")
async def get_insights(body: InsightRequest):
    if len(body.prices) < 5:
        raise HTTPException(status_code=400, detail="Need at least 5 price points")

    prices_list = [p.dict() for p in body.prices]
    
    try:
        from services.anomaly_engine import detect_Anomalies
        anomalies = detect_Anomalies(prices_list)
    except Exception as e:
        print("Anomaly engine error:", str(e))
        anomalies = []

    try:
        from services.llm_client import generate_stock_insight
        insight = generate_stock_insight(
            ticker=body.ticker,
            prices=prices_list,
            anomalies=anomalies
        )
    except Exception as e:
        print("LLM client error:", str(e))
        insight = {"error": str(e)}

    return {
        "ticker": body.ticker,
        "days_analyzed": len(body.prices),
        "anomalies_found": len(anomalies),
        "insight": insight
    }