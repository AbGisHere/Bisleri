"""Product detection and categorization using Kimi K2.5 vision."""

import base64
import json
import re
from loguru import logger

from services.llm_client import chat_with_tools

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

SYSTEM_PROMPT = (
    "You are a product categorization expert for Rangaayan, a marketplace for rural Indian artisans.\n\n"
    "Given an image, identify the product(s) and categorize them.\n\n"
    "Available categories: " + ", ".join(PRODUCT_CATEGORIES) + "\n\n"
    "Reply as raw JSON only (no code fences):\n"
    '{"products": [{"name": "...", "category": "...", "confidence": 0.0-1.0}], '
    '"suggested_categories": ["..."]}'
)


def _parse_response(raw: str) -> dict:
    cleaned = re.sub(r"```(?:json)?\s*", "", raw).strip().rstrip("`")
    try:
        parsed = json.loads(cleaned)
        products = parsed.get("products", [])
        suggested = parsed.get("suggested_categories", [])
        if not suggested and products:
            suggested = list({p["category"] for p in products if p.get("category")})
        return {
            "detections": products,
            "suggested_categories": suggested,
            "object_count": len(products),
        }
    except (json.JSONDecodeError, AttributeError):
        logger.warning(f"Failed to parse detection response: {raw[:200]}")
        return {"detections": [], "suggested_categories": ["handicraft"], "object_count": 0}


async def detect_products(image_bytes: bytes) -> dict:
    """Detect and categorize products in an image using LLM vision."""
    b64 = base64.b64encode(image_bytes).decode()
    data_url = f"data:image/jpeg;base64,{b64}"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": data_url}},
                {"type": "text", "text": "What product(s) are in this image? Categorize them."},
            ],
        },
    ]

    raw = await chat_with_tools(
        messages=messages,
        tools=None,
        max_tokens=512,
        reasoning=False,
    )

    return _parse_response(raw)
