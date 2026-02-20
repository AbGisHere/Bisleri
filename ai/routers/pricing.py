import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.ai_pricing import get_pricing_suggestion, get_pricing_suggestion_stream

router = APIRouter()


class PricingRequest(BaseModel):
    product_name: str
    cost_price: float | None = None
    category: str | None = None
    quality: str | None = None
    location: str | None = None


@router.post("/")
async def suggest_pricing(req: PricingRequest):
    return await get_pricing_suggestion(
        product_name=req.product_name,
        cost_price=req.cost_price,
        category=req.category,
        quality=req.quality,
        location=req.location,
    )


@router.post("/stream")
async def suggest_pricing_stream(req: PricingRequest):
    async def event_generator():
        async for event in get_pricing_suggestion_stream(
            product_name=req.product_name,
            cost_price=req.cost_price,
            category=req.category,
            quality=req.quality,
            location=req.location,
        ):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
