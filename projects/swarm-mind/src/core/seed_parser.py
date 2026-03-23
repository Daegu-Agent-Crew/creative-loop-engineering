"""Seed text parser - extracts structured data from input text."""

from __future__ import annotations

import json
from pydantic import BaseModel, Field

from src.llm.provider import LLMProvider
from src.llm.prompts import SEED_PARSE_PROMPT


class SeedData(BaseModel):
    """Structured seed data extracted from input text."""
    entities: list[str] = Field(default_factory=list)
    events: list[str] = Field(default_factory=list)
    context: str = ""
    key_question: str = ""
    raw_text: str = ""


class SeedParser:
    """Parses seed text into structured data using LLM."""

    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def parse(self, text: str) -> SeedData:
        """Parse input text into structured seed data."""
        response = await self.llm.complete(
            system_prompt=SEED_PARSE_PROMPT,
            user_prompt=text,
            temperature=0.3,
        )

        try:
            # Try to parse JSON from response
            data = json.loads(self._extract_json(response))
            return SeedData(
                entities=data.get("entities", []),
                events=data.get("events", []),
                context=data.get("context", text),
                key_question=data.get("key_question", text),
                raw_text=text,
            )
        except (json.JSONDecodeError, KeyError):
            # Fallback: use the raw text as context
            return SeedData(
                entities=[],
                events=[],
                context=text,
                key_question=text,
                raw_text=text,
            )

    def _extract_json(self, text: str) -> str:
        """Extract JSON from a response that might have extra text."""
        # Try to find JSON block
        if "```json" in text:
            start = text.index("```json") + 7
            end = text.index("```", start)
            return text[start:end].strip()
        if "```" in text:
            start = text.index("```") + 3
            end = text.index("```", start)
            return text[start:end].strip()
        # Try to find raw JSON
        for i, ch in enumerate(text):
            if ch == "{":
                # Find matching closing brace
                depth = 0
                for j in range(i, len(text)):
                    if text[j] == "{":
                        depth += 1
                    elif text[j] == "}":
                        depth -= 1
                        if depth == 0:
                            return text[i : j + 1]
                break
        return text
