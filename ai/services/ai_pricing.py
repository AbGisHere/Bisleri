"""AI pricing service using MiniMax via OpenRouter with tool calling."""

from datetime import datetime

from services.llm_client import chat_with_tools
from scrapers.web_search import web_search, fetch_page_content
from scrapers.marketplace import get_competitor_data

PRICING_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search the web for pricing data, market rates, raw material costs, and competitor pricing strategies.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query for pricing research",
                    },
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "fetch_page",
            "description": "Fetch and read the text content of a webpage URL for detailed pricing or market information.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "URL to fetch content from",
                    },
                },
                "required": ["url"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_competitor_prices",
            "description": "Get competitor product listings and prices from Amazon.in, Flipkart, and IndiaMART.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {
                        "type": "string",
                        "description": "Product to search for competitor prices",
                    },
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
                    "cost_price": {
                        "type": "number",
                        "description": "Total cost of production in INR",
                    },
                    "selling_price": {
                        "type": "number",
                        "description": "Proposed selling price in INR",
                    },
                    "platform_fee_percent": {
                        "type": "number",
                        "description": "Platform/marketplace fee percentage (default 10)",
                    },
                    "shipping_cost": {
                        "type": "number",
                        "description": "Shipping cost per unit in INR (default 50)",
                    },
                },
                "required": ["cost_price", "selling_price"],
            },
        },
    },
]


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

SYSTEM_PROMPT = """You are a pricing strategist for rural Indian products sold by women entrepreneurs on a marketplace called Bisleri.

Your goal is to suggest optimal pricing that:
1. Undercuts or matches competitor prices while maintaining healthy margins
2. Accounts for production costs, platform fees, and shipping
3. Considers the product quality and unique value of handmade/artisan products

Use the available tools to:
1. Search the web for current market rates and pricing trends
2. Get competitor prices from Amazon.in, Flipkart, IndiaMART
3. Calculate margins for different price points
4. Optionally fetch specific pages for detailed pricing data

Provide your recommendation as:
- Recommended price (INR)
- Price range (minimum viable to premium)
- Competitor price comparison
- Margin analysis at recommended price
- Pricing strategy (penetration, value-based, premium artisan, etc.)
- Tips to justify the price (storytelling, packaging, certification)

Be practical. These are rural women with real costs - don't suggest unsustainably low prices."""


async def get_pricing_suggestion(
    product_name: str,
    cost_price: float | None = None,
    category: str | None = None,
    quality: str | None = None,
    location: str | None = None,
) -> dict:
    user_msg = f"Suggest optimal pricing for: {product_name}"
    if cost_price:
        user_msg += f"\nProduction cost: ₹{cost_price}"
    if category:
        user_msg += f"\nCategory: {category}"
    if quality:
        user_msg += f"\nQuality: {quality}"
    if location:
        user_msg += f"\nLocation: {location}"

    user_msg += "\n\nSearch for competitor prices, analyze the market, and calculate margins to suggest the best price."

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ]

    analysis = await chat_with_tools(
        messages=messages,
        tools=PRICING_TOOLS,
        tool_handlers=TOOL_HANDLERS,
    )

    return {
        "product": product_name,
        "cost_price": cost_price,
        "category": category,
        "analysis": analysis,
        "generated_at": datetime.now().isoformat(),
    }
