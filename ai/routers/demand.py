from fastapi import APIRouter
from pydantic import BaseModel

from services.demand_insights import get_demand_insights

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
