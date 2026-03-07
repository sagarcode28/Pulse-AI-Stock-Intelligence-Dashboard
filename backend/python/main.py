from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.anomaly import router as anomaly_router

app = FastAPI(title="Python Service", description="Anomaly detection & AI insights for stock data")

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:4000", "http://localhost:3000", "http://localhost:8000"],
                   allow_methods=["*"], allow_headers=["*"])

app.include_router(anomaly_router, prefix="/api")

@app.get("/health")
async def health():
    return { "status" : "OK", "Message" : "Anomaly detection Service" }