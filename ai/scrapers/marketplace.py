"""Web scrapers for Indian marketplaces - competitor price & demand data."""

import asyncio
import random

import httpx
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from loguru import logger

ua = UserAgent()


async def _fetch(url: str, client: httpx.AsyncClient) -> str | None:
    """Fetch a URL with random user agent and retry logic."""
    headers = {
        "User-Agent": ua.random,
        "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
        "Accept": "text/html,application/xhtml+xml",
    }
    try:
        await asyncio.sleep(random.uniform(1.0, 3.0))  # polite delay
        resp = await client.get(url, headers=headers, follow_redirects=True, timeout=15)
        resp.raise_for_status()
        return resp.text
    except Exception as e:
        logger.warning(f"Failed to fetch {url}: {e}")
        return None


async def scrape_amazon_prices(query: str, max_results: int = 10) -> list[dict]:
    """Scrape Amazon.in search results for product prices."""
    results = []
    search_url = f"https://www.amazon.in/s?k={query.replace(' ', '+')}"

    async with httpx.AsyncClient() as client:
        html = await _fetch(search_url, client)
        if not html:
            return results

        soup = BeautifulSoup(html, "html.parser")
        items = soup.select("div[data-component-type='s-search-result']")

        for item in items[:max_results]:
            title_el = item.select_one("h2 a span")
            price_el = item.select_one("span.a-price-whole")
            rating_el = item.select_one("span.a-icon-alt")
            review_count_el = item.select_one("span.a-size-base.s-underline-text")

            if title_el and price_el:
                price_text = price_el.get_text(strip=True).replace(",", "")
                try:
                    price = float(price_text)
                except ValueError:
                    continue

                results.append({
                    "source": "amazon.in",
                    "title": title_el.get_text(strip=True),
                    "price_inr": price,
                    "rating": rating_el.get_text(strip=True) if rating_el else None,
                    "review_count": review_count_el.get_text(strip=True) if review_count_el else None,
                })

    return results


async def scrape_flipkart_prices(query: str, max_results: int = 10) -> list[dict]:
    """Scrape Flipkart search results for product prices."""
    results = []
    search_url = f"https://www.flipkart.com/search?q={query.replace(' ', '+')}"

    async with httpx.AsyncClient() as client:
        html = await _fetch(search_url, client)
        if not html:
            return results

        soup = BeautifulSoup(html, "html.parser")

        # Flipkart uses dynamic class names, look for price patterns
        price_elements = soup.select("div._30jeq3, div.Nx9bqj")
        title_elements = soup.select("div._4rR01T, a.IRpwTa, a.wjcEIp")

        for i in range(min(len(title_elements), len(price_elements), max_results)):
            price_text = price_elements[i].get_text(strip=True).replace("₹", "").replace(",", "")
            try:
                price = float(price_text)
            except ValueError:
                continue

            results.append({
                "source": "flipkart",
                "title": title_elements[i].get_text(strip=True),
                "price_inr": price,
            })

    return results


async def scrape_indiamart_prices(query: str, max_results: int = 10) -> list[dict]:
    """Scrape IndiaMART for wholesale/B2B pricing."""
    results = []
    search_url = f"https://dir.indiamart.com/search.mp?ss={query.replace(' ', '+')}"

    async with httpx.AsyncClient() as client:
        html = await _fetch(search_url, client)
        if not html:
            return results

        soup = BeautifulSoup(html, "html.parser")
        cards = soup.select("div.prd-card, div.lcr")

        for card in cards[:max_results]:
            title_el = card.select_one("a.prd-name, h2.lcr-h2")
            price_el = card.select_one("span.price, p.price")

            if title_el:
                price_text = ""
                if price_el:
                    price_text = price_el.get_text(strip=True)

                results.append({
                    "source": "indiamart",
                    "title": title_el.get_text(strip=True),
                    "price_range": price_text,
                    "type": "wholesale/B2B",
                })

    return results


async def scrape_google_trends_proxy(query: str) -> dict:
    """Get approximate demand signals by scraping Google search suggestions."""
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
    """Aggregate competitor data from all sources."""
    amazon, flipkart, indiamart, trends = await asyncio.gather(
        scrape_amazon_prices(product_name),
        scrape_flipkart_prices(product_name),
        scrape_indiamart_prices(product_name),
        scrape_google_trends_proxy(product_name),
        return_exceptions=True,
    )

    # Handle exceptions gracefully
    amazon = amazon if isinstance(amazon, list) else []
    flipkart = flipkart if isinstance(flipkart, list) else []
    indiamart = indiamart if isinstance(indiamart, list) else []
    trends = trends if isinstance(trends, dict) else {"demand_signal": "unknown"}

    all_prices = [
        item["price_inr"]
        for source in [amazon, flipkart]
        for item in source
        if "price_inr" in item
    ]

    return {
        "product": product_name,
        "amazon": amazon,
        "flipkart": flipkart,
        "indiamart": indiamart,
        "trends": trends,
        "price_summary": {
            "min": min(all_prices) if all_prices else None,
            "max": max(all_prices) if all_prices else None,
            "avg": round(sum(all_prices) / len(all_prices), 2) if all_prices else None,
            "count": len(all_prices),
        },
    }
