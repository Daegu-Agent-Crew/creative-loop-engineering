"""Multi-round simulation engine."""

from __future__ import annotations

from pydantic import BaseModel, Field

from src.agents.base import AgentResponse
from src.core.orchestrator import Orchestrator
from src.core.seed_parser import SeedData, SeedParser
from src.core.knowledge_graph import KnowledgeGraph
from src.llm.provider import LLMProvider


class RoundResult(BaseModel):
    """Results from a single simulation round."""
    round_number: int
    responses: list[AgentResponse]
    sentiment_summary: dict[str, int] = Field(default_factory=dict)


class SimulationResult(BaseModel):
    """Complete simulation results."""
    seed_data: SeedData
    rounds: list[RoundResult]
    total_agents: int
    total_rounds: int
    sentiment_distribution: dict[str, int] = Field(default_factory=dict)
    all_responses: list[AgentResponse] = Field(default_factory=list)


class Simulation:
    """Runs multi-round agent simulations."""

    def __init__(self, llm: LLMProvider):
        self.llm = llm
        self.parser = SeedParser(llm)
        self.orchestrator = Orchestrator(llm)
        self.knowledge_graph = KnowledgeGraph()

    async def run(
        self,
        seed_text: str,
        num_agents: int = 4,
        num_rounds: int = 1,
        archetypes: list[str] | None = None,
    ) -> SimulationResult:
        """Execute a full simulation."""
        # Step 1: Parse seed text
        seed_data = await self.parser.parse(seed_text)

        # Step 2: Build knowledge graph
        self.knowledge_graph.add_entities(seed_data.entities)
        for event in seed_data.events:
            self.knowledge_graph.add_event(event, seed_data.entities)

        # Step 3: Spawn agents
        self.orchestrator.spawn_agents(num_agents, archetypes)

        # Step 4: Run rounds
        rounds: list[RoundResult] = []
        all_responses: list[AgentResponse] = []
        previous_context = ""

        for round_num in range(1, num_rounds + 1):
            responses = await self.orchestrator.run_round(
                seed_context=seed_data.context,
                entities=seed_data.entities,
                events=seed_data.events,
                previous_responses=previous_context,
            )

            sentiment = self._count_sentiments(responses)
            round_result = RoundResult(
                round_number=round_num,
                responses=responses,
                sentiment_summary=sentiment,
            )
            rounds.append(round_result)
            all_responses.extend(responses)

            # Build context for next round
            previous_context = self.orchestrator.format_responses(responses)

        # Aggregate sentiments
        total_sentiment = self._count_sentiments(all_responses)

        return SimulationResult(
            seed_data=seed_data,
            rounds=rounds,
            total_agents=num_agents,
            total_rounds=num_rounds,
            sentiment_distribution=total_sentiment,
            all_responses=all_responses,
        )

    def _count_sentiments(self, responses: list[AgentResponse]) -> dict[str, int]:
        """Count sentiment distribution."""
        counts: dict[str, int] = {"positive": 0, "negative": 0, "neutral": 0}
        for r in responses:
            if r.sentiment in counts:
                counts[r.sentiment] += 1
            else:
                counts["neutral"] += 1
        return counts
