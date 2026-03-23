"""OpenAI-compatible LLM provider."""

import asyncio
from openai import AsyncOpenAI
from src.config import LLMConfig


class LLMProvider:
    """Async LLM client compatible with any OpenAI-compatible API."""

    def __init__(self, config: LLMConfig | None = None):
        if config is None:
            config = LLMConfig()
        self.config = config
        self.client = AsyncOpenAI(
            api_key=config.api_key,
            base_url=config.base_url,
        )
        self.model = config.model_name

    async def complete(self, system_prompt: str, user_prompt: str, temperature: float = 0.7) -> str:
        """Send a chat completion request and return the response text."""
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
        )
        return response.choices[0].message.content or ""

    async def complete_with_history(
        self, system_prompt: str, messages: list[dict], temperature: float = 0.7
    ) -> str:
        """Send a chat completion with full message history."""
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=full_messages,
            temperature=temperature,
        )
        return response.choices[0].message.content or ""
