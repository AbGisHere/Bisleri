"""AI pricing service using Kimi K2.5 via OpenRouter with tool calling."""

from collections.abc import AsyncGenerator
from datetime import datetime

from services.llm_client import chat_with_tools, chat_with_tools_stream
from scrapers.web_search import web_search, fetch_page_content
from scrapers.marketplace import get_competitor_data

PRICING_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search the web for pricing data, market rates, and competitor strategies.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query for pricing research"},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "fetch_page",
            "description": "Read a webpage for detailed pricing or market data.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "URL to fetch"},
                },
                "required": ["url"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_competitor_prices",
            "description": "Get competitor listings from Amazon.in, Flipkart, IndiaMART.",
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
            "name": "calculate_margin",
            "description": "Calculate profit margins given cost and selling price.",
            "parameters": {
                "type": "object",
                "properties": {
                    "cost_price": {"type": "number", "description": "Production cost in INR"},
                    "selling_price": {"type": "number", "description": "Proposed selling price in INR"},
                    "platform_fee_percent": {"type": "number", "description": "Platform fee % (default 10)"},
                    "shipping_cost": {"type": "number", "description": "Shipping cost per unit INR (default 50)"},
                },
                "required": ["cost_price", "selling_price"],
            },
        },
    },
]

SYSTEM_PROMPT = """You are a pricing strategist for rural Indian products sold by women entrepreneurs on Rangaayan marketplace.

Use the available tools to gather real market data before responding.

Your response MUST begin with this exact line (replace N with your recommended price):
SUGGESTED_PRICE: ₹N

Then provide a concise analysis:
- Price range (minimum viable to premium)
- Competitor price comparison
- Margin analysis
- Pricing strategy recommendation
- Tips to justify the price

Keep it practical. Use plain text, no markdown headers or emojis."""


async def _handle_web_search(query: str) -> list[dict]:
    return await web_search(query, num_results=5)


async def _handle_fetch_page(url: str) -> str:
    return await fetch_page_content(url)


async def _handle_competitor_prices(product_name: str) -> dict:
    return await get_competitor_data(product_name)


async def _handle_calculate_margin(
    cost_price: float,
    selling_price: float,
    platform_fee_percent: float = 10,
    shipping_cost: float = 50,
) -> dict:
    platform_fee = selling_price * (platform_fee_percent / 100)
    total_cost = cost_price + platform_fee + shipping_cost
    profit = selling_price - total_cost
    margin_percent = (profit / selling_price) * 100 if selling_price > 0 else 0
    return {
        "cost_price": cost_price,
        "selling_price": selling_price,
        "platform_fee": round(platform_fee, 2),
        "shipping_cost": shipping_cost,
        "total_cost": round(total_cost, 2),
        "profit_per_unit": round(profit, 2),
        "margin_percent": round(margin_percent, 1),
        "viable": margin_percent >= 20,
        "assessment": (
            "Good margin" if margin_percent >= 40
            else "Acceptable margin" if margin_percent >= 25
            else "Thin margin - consider raising price" if margin_percent >= 15
            else "Not viable - costs exceed revenue" if margin_percent < 0
            else "Very thin margin - risky"
        ),
    }


TOOL_HANDLERS = {
    "web_search": _handle_web_search,
    "fetch_page": _handle_fetch_page,
    "get_competitor_prices": _handle_competitor_prices,
    "calculate_margin": _handle_calculate_margin,
}


def _build_messages(
    product_name: str,
    cost_price: float | None,
    category: str | None,
    quality: str | None,
    location: str | None,
) -> list[dict]:
    user_msg = f"Suggest optimal pricing for: {product_name}"
    if cost_price:
        user_msg += f"\nProduction cost: ₹{cost_price}"
    if category:
        user_msg += f"\nCategory: {category}"
    if quality:
        user_msg += f"\nQuality: {quality}"
    if location:
        user_msg += f"\nLocation: {location}"
    user_msg += "\n\nSearch for competitor prices and analyze the market to suggest the best price."
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ]


async def get_pricing_suggestion(
    product_name: str,
    cost_price: float | None = None,
    category: str | None = None,
    quality: str | None = None,
    location: str | None = None,
) -> dict:
    messages = _build_messages(product_name, cost_price, category, quality, location)
    analysis = await chat_with_tools(
        messages=messages,
        tools=PRICING_TOOLS,
        tool_handlers=TOOL_HANDLERS,
    )
    return {
        "product": product_name,
        "analysis": analysis,
        "generated_at": datetime.now().isoformat(),
    }


async def get_pricing_suggestion_stream(
    product_name: str,
    cost_price: float | None = None,
    category: str | None = None,
    quality: str | None = None,
    location: str | None = None,
) -> AsyncGenerator[dict, None]:
    messages = _build_messages(product_name, cost_price, category, quality, location)
    async for event in chat_with_tools_stream(
        messages=messages,
        tools=PRICING_TOOLS,
        tool_handlers=TOOL_HANDLERS,
    ):
        yield event
