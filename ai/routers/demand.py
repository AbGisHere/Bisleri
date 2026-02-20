import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.demand_insights import get_demand_insights, get_demand_insights_stream

router = APIRouter()


class DemandRequest(BaseModel):
    product_name: str
    category: str | None = None
    location: str | None = None


@router.post("/")
async def analyze_demand(req: DemandRequest):
    return await get_demand_insights(
        product_name=req.product_name,
        category=req.category,
        location=req.location,
    )


@router.post("/stream")
async def analyze_demand_stream(req: DemandRequest):
    async def event_generator():
        async for event in get_demand_insights_stream(
            product_name=req.product_name,
            category=req.category,
            location=req.location,
        ):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
