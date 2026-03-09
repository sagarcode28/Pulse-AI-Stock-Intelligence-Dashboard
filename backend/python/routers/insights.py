from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.llm_client import generate_stock_insight
from services.anomaly_engine import detect_Anomalies

router = APIRouter()

class PricePoint(BaseModel):
    date : str
    open : float
    high : float
    low : float
    close : float
    volume : int

class InsightRequest(BaseModel):
    ticker : str
    prices : List[PricePoint]

@router.post("/insights")
async def get_insights(body: InsightRequest):
    if(len(body.prices) < 5):
        raise HTTPException(status_code=400, detail="Need at least 5 price points for insight generation")
    
    prices_list = [p.dict() for p in body.prices]

    anomalies = detect_Anomalies(prices_list)
    insights = generate_stock_insight(
        ticker=body.ticker,
        prices=prices_list,
        anomalies=anomalies
    )

    return{
        "ticker" : body.ticker,
        "days_analyzed" : len(body.prices),
        "anomalies_found" : len(anomalies),
        "insight": insights
    }