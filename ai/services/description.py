"""Product description generation — direct LLM call, no tools, no reasoning."""

import json
import re
from services.llm_client import chat_with_tools

CATEGORIES = ["Weaving", "Pottery", "Embroidery", "Food", "Jewellery", "Painting", "Basket Weaving", "Tailoring"]

SYSTEM_PROMPT = (
    "You write product descriptions for Rangaayan, a marketplace for rural Indian women entrepreneurs.\n\n"
    "Rules:\n"
    "- 1 sentence, max 100 characters\n"
    "- Mention the product and one quality (handmade, natural, traditional)\n"
    "- No markdown, no emojis, no filler words\n\n"
    "Also pick the best category from: " + ", ".join(CATEGORIES) + "\n\n"
    "Reply as raw JSON only, no code fences:\n"
    '{"description": "...", "category": "..."}'
)


def _parse_response(raw: str) -> dict:
    """Extract JSON from LLM response, handling code fences."""
    cleaned = re.sub(r"```(?:json)?\s*", "", raw).strip().rstrip("`")
    try:
        parsed = json.loads(cleaned)
        return {
            "description": str(parsed.get("description", "")),
            "category": parsed.get("category"),
        }
    except (json.JSONDecodeError, AttributeError):
        return {"description": raw.strip(), "category": None}


async def generate_description(
    product_name: str,
    category: str | None = None,
) -> dict:
    """Returns {"description": str, "category": str | None}."""
    user_msg = product_name
    if category:
        user_msg += f" ({category})"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ]

    raw = await chat_with_tools(
        messages=messages,
        tools=None,
        max_tokens=150,
        reasoning=False,
    )

    return _parse_response(raw)
