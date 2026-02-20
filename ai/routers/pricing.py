from fastapi import APIRouter
from pydantic import BaseModel

from services.ai_pricing import get_pricing_suggestion

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
