from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from services.anomaly_engine import detect_Anomalies

router = APIRouter()

# Input scheme
class PricePoint(BaseModel):
    date : str
    open : float
    high : float
    low : float
    close : float
    volume : int

class AnomalyRequest(BaseModel):
    ticker : str
    prices : List[PricePoint]

@router.post("/anomaly")
async def get_anamolies(body: AnomalyRequest):
    if not body.prices:
        raise HTTPException(status_code=400, detail="No Price Provided")
    
    print(body.prices)
    
    #conver the pydantic to dict
    prices_list = [p.dict() for p in body.prices]

    anamolies = detect_Anomalies(prices_list)

    return{
        "ticker" : body.ticker,
        "total_days_analyzed" : len(body.prices),
        "anomalies_found" : len(anamolies),
        "anamolies" : anamolies
    }
