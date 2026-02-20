from fastapi import APIRouter, UploadFile, File
from services.object_detection import detector

router = APIRouter()


@router.post("/")
async def detect_products(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = await detector.detect(image_bytes)
    return result


@router.get("/categories")
async def list_categories():
    from services.object_detection import PRODUCT_CATEGORIES
    return {"categories": PRODUCT_CATEGORIES}
