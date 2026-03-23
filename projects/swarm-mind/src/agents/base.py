"""Base agent class with LLM integration."""

from __future__ import annotations

import uuid
from pydantic import BaseModel, Field

from src.agents.profiles import AgentProfile
from src.llm.provider import LLMProvider
from src.llm.prompts import AGENT_SYSTEM_TEMPLATE


class AgentResponse(BaseModel):
    """Structured response from an agent."""
    agent_id: str
    agent_name: str
    archetype: str
    response: str
    sentiment: str = "neutral"  # positive, negative, neutral
    confidence: str = "medium"  # low, medium, high


class BaseAgent:
    """Base agent that uses an LLM to generate analysis."""

    def __init__(self, profile: AgentProfile, llm: LLMProvider):
        self.id = str(uuid.uuid4())[:8]
        self.profile = profile
        self.llm = llm
        self.history: list[str] = []

    @property
    def name(self) -> str:
        return f"{self.profile.name}-{self.id}"

    async def analyze(
        self,
        seed_context: str,
        entities: list[str],
        events: list[str],
        previous_responses: str = "",
    ) -> AgentResponse:
        """Generate analysis for the given seed data."""
        prompt = AGENT_SYSTEM_TEMPLATE.format(
            archetype_name=self.profile.name,
            description=self.profile.description,
            style=self.profile.style,
            seed_context=seed_context,
            entities=", ".join(entities),
            events=", ".join(events),
            previous_responses=previous_responses or "No previous discussion yet.",
        )

        response_text = await self.llm.complete(
            system_prompt=prompt,
            user_prompt="Provide your analysis and prediction now.",
            temperature=self.profile.temperature,
        )

        self.history.append(response_text)

        # Extract sentiment and confidence from response
        sentiment = self._extract_sentiment(response_text)
        confidence = self._extract_confidence(response_text)

        return AgentResponse(
            agent_id=self.id,
            agent_name=self.name,
            archetype=self.profile.archetype,
            response=response_text,
            sentiment=sentiment,
            confidence=confidence,
        )

    def _extract_sentiment(self, text: str) -> str:
        """Simple keyword-based sentiment extraction."""
        text_lower = text.lower()
        pos_keywords = ["positive", "optimistic", "bullish", "favorable", "promising"]
        neg_keywords = ["negative", "pessimistic", "bearish", "unfavorable", "concerning"]
        pos_count = sum(1 for k in pos_keywords if k in text_lower)
        neg_count = sum(1 for k in neg_keywords if k in text_lower)
        if pos_count > neg_count:
            return "positive"
        elif neg_count > pos_count:
            return "negative"
        return "neutral"

    def _extract_confidence(self, text: str) -> str:
        """Simple keyword-based confidence extraction."""
        text_lower = text.lower()
        if "high confidence" in text_lower or "highly likely" in text_lower:
            return "high"
        elif "low confidence" in text_lower or "uncertain" in text_lower or "unlikely" in text_lower:
            return "low"
        return "medium"
