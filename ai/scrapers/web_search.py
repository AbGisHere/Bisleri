"""Web search tool for LLM tool calling - uses DuckDuckGo (free, no API key)."""

import asyncio
import json
from urllib.parse import quote_plus

import httpx
from selectolax.parser import HTMLParser
from fake_useragent import UserAgent
from loguru import logger

ua = UserAgent()


async def web_search(query: str, num_results: int = 5) -> list[dict]:
    results = await _ddg_search(query, num_results)
    if not results:
        results = await _google_scrape(query, num_results)
    return results


async def _ddg_search(query: str, num_results: int = 5) -> list[dict]:
    headers = {"User-Agent": ua.random}
    url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, headers=headers, timeout=10, follow_redirects=True)
            resp.raise_for_status()
        except Exception as e:
            logger.warning(f"DuckDuckGo search failed: {e}")
            return []

    tree = HTMLParser(resp.text)
    results = []

    for node in tree.css("div.result"):
        title_node = node.css_first("a.result__a")
        snippet_node = node.css_first("a.result__snippet")

        if not title_node:
            continue

        title = title_node.text(strip=True)
        href = title_node.attributes.get("href", "")
        snippet = snippet_node.text(strip=True) if snippet_node else ""

        if title and href:
            results.append({
                "title": title,
                "url": href,
                "snippet": snippet,
            })

        if len(results) >= num_results:
            break

    return results


async def _google_scrape(query: str, num_results: int = 5) -> list[dict]:
    headers = {
        "User-Agent": ua.random,
        "Accept-Language": "en-IN,en;q=0.9",
    }
    url = f"https://www.google.com/search?q={quote_plus(query)}&num={num_results}&hl=en"

    async with httpx.AsyncClient() as client:
        try:
            await asyncio.sleep(1.0)
            resp = await client.get(url, headers=headers, timeout=10, follow_redirects=True)
            resp.raise_for_status()
        except Exception as e:
            logger.warning(f"Google scrape failed: {e}")
            return []

    tree = HTMLParser(resp.text)
    results = []

    for node in tree.css("div.g"):
        title_node = node.css_first("h3")
        link_node = node.css_first("a")
        snippet_node = node.css_first("div.VwiC3b, span.aCOpRe")

        if not title_node or not link_node:
            continue

        href = link_node.attributes.get("href", "")
        if not href.startswith("http"):
            continue

        results.append({
            "title": title_node.text(strip=True),
            "url": href,
            "snippet": snippet_node.text(strip=True) if snippet_node else "",
        })

        if len(results) >= num_results:
            break

    return results


async def fetch_page_content(url: str, max_chars: int = 3000) -> str:
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
