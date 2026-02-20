"""Competitor price data via search-based extraction (no direct scraping)."""

import asyncio
import re

import httpx
from loguru import logger

from scrapers.web_search import web_search


def _extract_prices_from_snippets(results: list[dict]) -> list[dict]:
    """Extract INR prices from search result titles and snippets."""
    price_pattern = re.compile(r"₹\s*([\d,]+(?:\.\d{2})?)")
    items = []

    for r in results:
        text = f"{r.get('title', '')} {r.get('snippet', '')}"
        prices = price_pattern.findall(text)
        if not prices:
            continue

        for p in prices[:1]:  # take first price per result
            try:
                price = float(p.replace(",", ""))
                if price < 1 or price > 500_000:
                    continue
                items.append({
                    "title": r.get("title", ""),
                    "price_inr": price,
                    "source": _detect_source(r.get("url", "")),
                })
            except ValueError:
                continue

    return items


def _detect_source(url: str) -> str:
    if "amazon" in url:
        return "amazon.in"
    if "flipkart" in url:
        return "flipkart"
    if "indiamart" in url:
        return "indiamart"
    if "meesho" in url:
        return "meesho"
    if "jiomart" in url:
        return "jiomart"
    return "other"


async def _search_marketplace_prices(product_name: str) -> list[dict]:
    """Search for prices across Indian marketplaces via web search."""
    queries = [
        f"{product_name} price buy India",
        f"{product_name} price site:amazon.in OR site:flipkart.com OR site:meesho.com",
    ]

    all_results = []
    for query in queries:
        results = await web_search(query, num_results=8)
        all_results.extend(results)

    return _extract_prices_from_snippets(all_results)


async def _google_suggestions(query: str) -> dict:
    """Get demand signals from Google search suggestions."""
    suggestions = []
    url = f"https://suggestqueries.google.com/complete/search?client=firefox&q={query.replace(' ', '+')}"

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, timeout=10)
            data = resp.json()
            if isinstance(data, list) and len(data) > 1:
                suggestions = data[1][:10]
        except Exception as e:
            logger.warning(f"Google suggestions failed: {e}")

    return {
        "query": query,
        "related_searches": suggestions,
        "demand_signal": "high" if len(suggestions) > 5 else "medium" if len(suggestions) > 2 else "low",
    }


async def get_competitor_data(product_name: str) -> dict:
    """Aggregate competitor data from search-based sources."""
    prices, trends = await asyncio.gather(
        _search_marketplace_prices(product_name),
        _google_suggestions(product_name),
        return_exceptions=True,
    )

    prices = prices if isinstance(prices, list) else []
    trends = trends if isinstance(trends, dict) else {"demand_signal": "unknown"}

    numeric_prices = [p["price_inr"] for p in prices if "price_inr" in p]

    return {
        "product": product_name,
        "listings": prices,
        "trends": trends,
        "price_summary": {
            "min": min(numeric_prices) if numeric_prices else None,
            "max": max(numeric_prices) if numeric_prices else None,
            "avg": round(sum(numeric_prices) / len(numeric_prices), 2) if numeric_prices else None,
            "count": len(numeric_prices),
        },
    }
