from fastapi import APIRouter
from pydantic import BaseModel

from scrapers.marketplace import get_competitor_data

router = APIRouter()


class CompetitorRequest(BaseModel):
    product_name: str


@router.post("/")
async def analyze_competitors(req: CompetitorRequest):
    return await get_competitor_data(req.product_name)
