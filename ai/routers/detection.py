from fastapi import APIRouter, UploadFile, File
from services.object_detection import detect_products, PRODUCT_CATEGORIES

router = APIRouter()


@router.post("/")
async def detect(file: UploadFile = File(...)):
    image_bytes = await file.read()
    return await detect_products(image_bytes)


@router.get("/categories")
async def list_categories():
    return {"categories": PRODUCT_CATEGORIES}
