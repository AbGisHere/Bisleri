"""Web search via duckduckgo-search library (reliable, no API key needed)."""

import httpx
from ddgs import DDGS
from selectolax.parser import HTMLParser
from fake_useragent import UserAgent
from loguru import logger

ua = UserAgent()


async def web_search(query: str, num_results: int = 5) -> list[dict]:
    """Search the web using DuckDuckGo. Returns list of {title, url, snippet}."""
    try:
        results = DDGS().text(query, max_results=num_results, region="in-en")
        return [
            {
                "title": r.get("title", ""),
                "url": r.get("href", ""),
                "snippet": r.get("body", ""),
            }
            for r in results
        ]
    except Exception as e:
        logger.warning(f"DuckDuckGo search failed: {e}")
        return []


async def fetch_page_content(url: str, max_chars: int = 3000) -> str:
    """Fetch and extract text content from a URL."""
    headers = {"User-Agent": ua.random}
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, headers=headers, timeout=10, follow_redirects=True)
            resp.raise_for_status()
        except Exception as e:
            return f"Failed to fetch: {e}"

    tree = HTMLParser(resp.text)

    for tag in tree.css("script, style, nav, footer, header, aside"):
        tag.decompose()

    text = tree.body.text(separator="\n", strip=True) if tree.body else ""
    return text[:max_chars]
