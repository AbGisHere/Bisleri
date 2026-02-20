"""Product detection and categorization using YOLOv8."""

import io
from pathlib import Path

import torch
from PIL import Image
from ultralytics import YOLO
from loguru import logger

from config import settings

# Rural product categories for fine-tuning
PRODUCT_CATEGORIES = [
    "handicraft",
    "textile",
    "pottery",
    "jewelry",
    "food_grain",
    "spice",
    "pickle",
    "oil",
    "basket_weaving",
    "embroidery",
    "leather_craft",
    "metal_craft",
    "wood_craft",
    "bamboo_craft",
    "jute_product",
    "honey",
    "dairy_product",
    "organic_produce",
    "herbal_product",
    "handloom",
]

# Mapping from COCO classes to our product-relevant categories
COCO_TO_PRODUCT = {
    "vase": "pottery",
    "bottle": "oil",
    "bowl": "pottery",
    "cup": "pottery",
    "handbag": "handicraft",
    "tie": "textile",
    "backpack": "handicraft",
    "clock": "wood_craft",
}


class ProductDetector:
    def __init__(self):
        self._model: YOLO | None = None

    @property
    def model(self) -> YOLO:
        if self._model is None:
            model_path = Path(settings.yolo_model_path)
            if model_path.exists():
                logger.info(f"Loading custom model from {model_path}")
                self._model = YOLO(str(model_path))
            else:
                logger.info("Loading pretrained YOLOv8n (will fine-tune later)")
                self._model = YOLO("yolov8n.pt")
        return self._model

    async def detect(self, image_bytes: bytes) -> dict:
        """Detect and categorize products in an image.

        Returns:
            dict with detections, suggested categories, and confidence scores
        """
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        results = self.model(image, conf=settings.yolo_confidence, verbose=False)
        result = results[0]

        detections = []
        categories_found = set()

        for box in result.boxes:
            cls_id = int(box.cls[0])
            cls_name = result.names[cls_id]
            confidence = float(box.conf[0])
            bbox = box.xyxy[0].tolist()

            product_category = COCO_TO_PRODUCT.get(cls_name, None)

            detection = {
                "class": cls_name,
                "product_category": product_category,
                "confidence": round(confidence, 3),
                "bbox": [round(c, 1) for c in bbox],
            }
            detections.append(detection)

            if product_category:
                categories_found.add(product_category)

        # Suggest categories based on visual features
        suggested_tags = list(categories_found) if categories_found else self._suggest_from_image(image)

        return {
            "detections": detections,
            "suggested_categories": suggested_tags,
            "object_count": len(detections),
        }

    def _suggest_from_image(self, image: Image.Image) -> list[str]:
        """Fallback: suggest categories based on image color/texture analysis."""
        import numpy as np

        arr = np.array(image.resize((64, 64)))
        avg_color = arr.mean(axis=(0, 1))

        suggestions = []

        # Earth tones -> pottery, handicraft
        if avg_color[0] > 150 and avg_color[1] < 130 and avg_color[2] < 100:
            suggestions.extend(["pottery", "leather_craft", "wood_craft"])
        # Bright colors -> textile, embroidery
        elif avg_color.std() > 50:
            suggestions.extend(["textile", "embroidery", "handloom"])
        # Green tones -> organic, herbal
        elif avg_color[1] > avg_color[0] and avg_color[1] > avg_color[2]:
            suggestions.extend(["organic_produce", "herbal_product"])
        else:
            suggestions.extend(["handicraft"])

        return suggestions


detector = ProductDetector()
