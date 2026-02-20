"""OpenRouter client with tool calling support."""

import json
from collections.abc import AsyncGenerator
from openai import AsyncOpenAI
from loguru import logger

from config import settings

client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.openrouter_api_key,
)

# Reasoning effort levels for Kimi K2.5.
# "none" disables reasoning (fast, cheap — use for simple generation).
# "low" / "medium" / "high" controls reasoning depth (use for complex analysis).
REASONING_NONE = {"reasoning": {"effort": "none"}}
REASONING_LOW = {"reasoning": {"effort": "low"}}


async def chat_with_tools(
    messages: list[dict],
    tools: list[dict] | None = None,
    tool_handlers: dict | None = None,
    model: str | None = None,
    max_iterations: int = 5,
    max_tokens: int = 2048,
    reasoning: bool = True,
) -> str:
    """Call the LLM with optional tool-calling loop.

    Args:
        reasoning: If False, disables the model's internal reasoning/thinking.
                   Use False for simple generation tasks (descriptions, rewrites).
                   Use True (default) for complex analysis that benefits from reasoning.
    """
    model = model or settings.llm_model
    tool_handlers = tool_handlers or {}

    for i in range(max_iterations):
        kwargs: dict = {"model": model, "messages": messages, "max_tokens": max_tokens}
        last_round = i == max_iterations - 1
        if tools and not last_round:
            kwargs["tools"] = tools
        if not reasoning:
            kwargs["extra_body"] = REASONING_NONE

        try:
            response = await client.chat.completions.create(**kwargs)
        except Exception as e:
            logger.error(f"OpenRouter API error: {e}")
            return f"AI service error: {e}"

        if not response.choices:
            logger.warning(f"Empty choices from OpenRouter")
            return "AI service returned an empty response. Please try again."

        choice = response.choices[0]
        logger.debug(f"[iter {i}] finish_reason={choice.finish_reason}, content_len={len(choice.message.content or '')}, tool_calls={bool(choice.message.tool_calls)}")

        if not last_round and (choice.finish_reason == "tool_calls" or choice.message.tool_calls):
            messages.append(choice.message.model_dump())
            for tool_call in choice.message.tool_calls:
                fn_name = tool_call.function.name
                fn_args = json.loads(tool_call.function.arguments)
                logger.info(f"Tool call: {fn_name}({fn_args})")
                handler = tool_handlers.get(fn_name)
                if handler:
                    result = await handler(**fn_args)
                else:
                    result = f"Error: no handler for tool '{fn_name}'"
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result) if not isinstance(result, str) else result,
                })
        else:
            content = choice.message.content or ""
            if not content:
                logger.warning(f"Empty content from LLM. finish_reason={choice.finish_reason}")
            return content

    return "Analysis could not be completed."


async def chat_with_tools_stream(
    messages: list[dict],
    tools: list[dict] | None = None,
    tool_handlers: dict | None = None,
    model: str | None = None,
    max_iterations: int = 5,
    max_tokens: int = 2048,
) -> AsyncGenerator[dict, None]:
    """Like chat_with_tools but yields SSE-style progress events.

    Always uses reasoning (tool-calling tasks are complex enough to benefit).
    """
    model = model or settings.llm_model
    tool_handlers = tool_handlers or {}

    yield {"type": "status", "message": "Starting analysis..."}

    for i in range(max_iterations):
        kwargs: dict = {"model": model, "messages": messages, "max_tokens": max_tokens}
        last_round = i == max_iterations - 1
        if tools and not last_round:
            kwargs["tools"] = tools

        try:
            response = await client.chat.completions.create(**kwargs)
        except Exception as e:
            logger.error(f"OpenRouter API error: {e}")
            yield {"type": "error", "message": f"AI service error: {e}"}
            return

        if not response.choices:
            yield {"type": "error", "message": "AI service returned an empty response."}
            return
        choice = response.choices[0]

        if not last_round and (choice.finish_reason == "tool_calls" or choice.message.tool_calls):
            messages.append(choice.message.model_dump())
            for tool_call in choice.message.tool_calls:
                fn_name = tool_call.function.name
                fn_args = json.loads(tool_call.function.arguments)
                logger.info(f"Tool call: {fn_name}({fn_args})")

                status_map = {
                    "web_search": "Searching the web...",
                    "get_competitor_prices": "Checking competitor prices...",
                    "get_seasonal_info": "Checking seasonal trends...",
                    "fetch_page": "Reading market data...",
                    "calculate_margin": "Calculating margins...",
                }
                yield {"type": "status", "message": status_map.get(fn_name, f"Running {fn_name}...")}

                handler = tool_handlers.get(fn_name)
                if handler:
                    result = await handler(**fn_args)
                else:
                    result = f"Error: no handler for tool '{fn_name}'"
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result) if not isinstance(result, str) else result,
                })
        else:
            yield {"type": "status", "message": "Generating analysis..."}
            content = choice.message.content or ""
            if not content:
                logger.warning(f"Empty content in stream. finish_reason={choice.finish_reason}")
                yield {"type": "error", "message": "AI returned empty response. Try again."}
            else:
                yield {"type": "result", "content": content}
            return

    yield {"type": "error", "message": "Analysis could not be completed."}
