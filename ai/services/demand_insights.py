"""Demand insights service using Kimi K2.5 via OpenRouter with tool calling."""

from collections.abc import AsyncGenerator
from datetime import datetime

from services.llm_client import chat_with_tools, chat_with_tools_stream
from scrapers.web_search import web_search
from scrapers.marketplace import get_competitor_data

SEASONAL_PATTERNS: dict[str, dict[int, dict]] = {
    "textile": {
        1: {"demand": "high", "reason": "Makar Sankranti, Republic Day"},
        2: {"demand": "medium", "reason": "Post-festival lull"},
        3: {"demand": "high", "reason": "Holi, spring collections"},
        4: {"demand": "medium", "reason": "New financial year"},
        5: {"demand": "medium", "reason": "Summer, lighter fabrics"},
        6: {"demand": "low", "reason": "Monsoon approaching"},
        7: {"demand": "low", "reason": "Monsoon season"},
        8: {"demand": "medium", "reason": "Raksha Bandhan, Independence Day"},
        9: {"demand": "high", "reason": "Ganesh Chaturthi, Navratri prep"},
        10: {"demand": "very_high", "reason": "Dussehra + Diwali, wedding season"},
        11: {"demand": "very_high", "reason": "Diwali, wedding season peak"},
        12: {"demand": "high", "reason": "Wedding season, Christmas"},
    },
    "food": {
        1: {"demand": "high", "reason": "Makar Sankranti - til, jaggery"},
        2: {"demand": "medium", "reason": "Regular demand"},
        3: {"demand": "high", "reason": "Holi specialties"},
        4: {"demand": "medium", "reason": "Summer foods"},
        5: {"demand": "high", "reason": "Mango products, summer drinks"},
        6: {"demand": "medium", "reason": "Monsoon foods, immunity products"},
        7: {"demand": "medium", "reason": "Monsoon snacks"},
        8: {"demand": "high", "reason": "Festival prep begins"},
        9: {"demand": "high", "reason": "Navratri fasting foods"},
        10: {"demand": "very_high", "reason": "Festival season - sweets, dry fruits"},
        11: {"demand": "very_high", "reason": "Diwali gifting - pickles, organic"},
        12: {"demand": "high", "reason": "Winter specialties, Christmas"},
    },
    "handicraft": {
        1: {"demand": "medium", "reason": "Republic Day crafts"},
        2: {"demand": "medium", "reason": "Valentine's Day gifts"},
        3: {"demand": "medium", "reason": "Holi, spring decor"},
        4: {"demand": "low", "reason": "Lean season"},
        5: {"demand": "low", "reason": "Summer"},
        6: {"demand": "low", "reason": "Monsoon"},
        7: {"demand": "low", "reason": "Monsoon"},
        8: {"demand": "medium", "reason": "Rakhi gifts, Independence Day"},
        9: {"demand": "high", "reason": "Ganesh idols, Navratri prep"},
        10: {"demand": "very_high", "reason": "Diwali decor, gifting season"},
        11: {"demand": "very_high", "reason": "Diwali, home decoration"},
        12: {"demand": "high", "reason": "Christmas, New Year gifts"},
    },
}

DEMAND_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search the web for market data, trends, and pricing for products in India.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"},
                    "num_results": {"type": "integer", "description": "Results to return (max 10)"},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_competitor_prices",
            "description": "Get competitor listings and prices from Indian marketplaces.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {"type": "string", "description": "Product to search"},
                },
                "required": ["product_name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_seasonal_info",
            "description": "Get seasonal demand patterns for a product category in India.",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string", "description": "Category like 'textile', 'food', 'handicraft'"},
                    "month": {"type": "integer", "description": "Month 1-12. Defaults to current."},
                },
                "required": ["category"],
            },
        },
    },
]

SYSTEM_PROMPT = """You are a demand analysis expert for rural Indian products sold by women entrepreneurs.

Use the available tools to gather real data before responding.

Your response MUST begin with this exact line (replace N with your score 0-100):
DEMAND_SCORE: N/100

Then provide a concise analysis:
- Current demand level and why
- Seasonal outlook for the next 3 months
- Recommended actions for the seller
- Best selling channels

Keep it practical. Use plain text, no markdown headers or emojis."""


async def _handle_web_search(query: str, num_results: int = 5) -> list[dict]:
    return await web_search(query, num_results=min(num_results, 10))


async def _handle_competitor_prices(product_name: str) -> dict:
    return await get_competitor_data(product_name)


async def _handle_seasonal_info(category: str, month: int | None = None) -> dict:
    month = month or datetime.now().month
    category_lower = category.lower()
    matched = next(
        (key for key in SEASONAL_PATTERNS if key in category_lower or category_lower in key),
        "handicraft",
    )
    pattern = SEASONAL_PATTERNS[matched].get(month, {"demand": "medium", "reason": "No specific data"})
    recs = {
        "very_high": "Peak season! Stock up, consider premium pricing, run festive bundles",
        "high": "Strong demand. Ensure good stock, moderate promotions",
        "medium": "Steady demand. Focus on marketing and building customer base",
        "low": "Lean period. Good for product development, offer discounts for cash flow",
    }
    return {
        "category": category,
        "month": month,
        "demand_level": pattern["demand"],
        "reason": pattern["reason"],
        "recommendation": recs.get(pattern["demand"], "Monitor market conditions"),
    }


TOOL_HANDLERS = {
    "web_search": _handle_web_search,
    "get_competitor_prices": _handle_competitor_prices,
    "get_seasonal_info": _handle_seasonal_info,
}


def _build_messages(product_name: str, category: str | None, location: str | None) -> list[dict]:
    user_msg = f"Analyze the demand for: {product_name}"
    if category:
        user_msg += f" (category: {category})"
    if location:
        user_msg += f" from {location}"
    user_msg += ". Use all available tools to gather data before giving your analysis."
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ]


async def get_demand_insights(
    product_name: str,
    category: str | None = None,
    location: str | None = None,
) -> dict:
    messages = _build_messages(product_name, category, location)
    analysis = await chat_with_tools(
        messages=messages,
        tools=DEMAND_TOOLS,
        tool_handlers=TOOL_HANDLERS,
    )
    return {
        "product": product_name,
        "analysis": analysis,
        "generated_at": datetime.now().isoformat(),
    }


async def get_demand_insights_stream(
    product_name: str,
    category: str | None = None,
    location: str | None = None,
) -> AsyncGenerator[dict, None]:
    messages = _build_messages(product_name, category, location)
    async for event in chat_with_tools_stream(
        messages=messages,
        tools=DEMAND_TOOLS,
        tool_handlers=TOOL_HANDLERS,
    ):
        yield event
