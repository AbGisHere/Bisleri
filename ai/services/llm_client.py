"""OpenRouter client for MiniMax model access with tool calling."""

import json
from openai import AsyncOpenAI
from loguru import logger

from config import settings

client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.openrouter_api_key,
)


async def chat_with_tools(
    messages: list[dict],
    tools: list[dict] | None = None,
    tool_handlers: dict | None = None,
    model: str | None = None,
    max_iterations: int = 5,
) -> str:
    """Chat with MiniMax via OpenRouter, handling tool calls automatically.

    Args:
        messages: OpenAI-format messages
        tools: Tool definitions (OpenAI function calling format)
        tool_handlers: Dict mapping tool names to async handler functions
        model: Override model (defaults to settings.minimax_model)
        max_iterations: Max tool-call round trips

    Returns:
        Final text response from the model
    """
    model = model or settings.minimax_model
    tool_handlers = tool_handlers or {}

    for _ in range(max_iterations):
        kwargs = {"model": model, "messages": messages}
        if tools:
            kwargs["tools"] = tools

        response = await client.chat.completions.create(**kwargs)
        choice = response.choices[0]

        if choice.finish_reason == "tool_calls" or choice.message.tool_calls:
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

                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(result) if not isinstance(result, str) else result,
                    }
                )
        else:
            return choice.message.content or ""

    return messages[-1].get("content", "Max iterations reached")
