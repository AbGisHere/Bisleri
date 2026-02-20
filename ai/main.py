from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from config import settings
from routers import detection, demand, pricing, describe, competitors

app = FastAPI(
    title="Rangaayan AI",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detection.router, prefix="/api/detect", tags=["Object Detection"])
app.include_router(describe.router, prefix="/api/describe", tags=["Description"])
app.include_router(pricing.router, prefix="/api/pricing", tags=["AI Pricing"])
app.include_router(competitors.router, prefix="/api/competitors", tags=["Competitors"])
app.include_router(demand.router, prefix="/api/demand", tags=["Demand Insights"])


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    logger.info(f"Starting Rangaayan AI on {settings.host}:{settings.port}")
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
