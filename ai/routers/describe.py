from fastapi import APIRouter
from pydantic import BaseModel

from services.description import generate_description

router = APIRouter()


class DescribeRequest(BaseModel):
    product_name: str
    category: str | None = None


@router.post("/")
async def describe_product(req: DescribeRequest):
    result = await generate_description(
        product_name=req.product_name,
        category=req.category,
    )
    return result
