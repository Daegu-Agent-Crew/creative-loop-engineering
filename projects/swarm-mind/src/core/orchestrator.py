"""Agent orchestrator - spawns and manages agents."""

from __future__ import annotations

import asyncio
import random

from src.agents.base import BaseAgent, AgentResponse
from src.agents.profiles import AGENT_PROFILES, DEFAULT_AGENTS, AgentProfile
from src.llm.provider import LLMProvider


class Orchestrator:
    """Spawns agents and manages their interactions."""

    def __init__(self, llm: LLMProvider):
        self.llm = llm
        self.agents: list[BaseAgent] = []

    def spawn_agents(self, num_agents: int, archetypes: list[str] | None = None) -> list[BaseAgent]:
        """Spawn agents with the specified archetypes.

        If num_agents > len(archetypes), agents are distributed across archetypes.
        """
        if archetypes is None:
            archetypes = DEFAULT_AGENTS

        # Validate archetypes
        valid = [a for a in archetypes if a in AGENT_PROFILES]
        if not valid:
            valid = DEFAULT_AGENTS

        self.agents = []
        for i in range(num_agents):
            archetype = valid[i % len(valid)]
            profile = AGENT_PROFILES[archetype]
            agent = BaseAgent(profile=profile, llm=self.llm)
            self.agents.append(agent)

        return self.agents

    async def run_round(
        self,
        seed_context: str,
        entities: list[str],
        events: list[str],
        previous_responses: str = "",
    ) -> list[AgentResponse]:
        """Run one round of analysis with all agents concurrently."""
        tasks = [
            agent.analyze(
                seed_context=seed_context,
                entities=entities,
                events=events,
                previous_responses=previous_responses,
            )
            for agent in self.agents
        ]
        responses = await asyncio.gather(*tasks, return_exceptions=True)

        # Filter out exceptions
        valid: list[AgentResponse] = []
        for r in responses:
            if isinstance(r, AgentResponse):
                valid.append(r)
        return valid

    def format_responses(self, responses: list[AgentResponse]) -> str:
        """Format agent responses as context for the next round."""
        parts = []
        for r in responses:
            parts.append(f"[{r.agent_name} ({r.archetype})]: {r.response}")
        return "\n\n".join(parts)
