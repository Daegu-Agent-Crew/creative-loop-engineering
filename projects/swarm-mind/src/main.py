"""SwarmMind main engine API."""

from __future__ import annotations

from src.config import get_config, AppConfig, LLMConfig
from src.core.simulation import Simulation, SimulationResult
from src.llm.provider import LLMProvider
from src.report.generator import ReportGenerator


class SwarmMind:
    """Main SwarmMind engine - public API."""

    def __init__(
        self,
        llm_provider: str = "openai",
        model: str | None = None,
        api_key: str | None = None,
        base_url: str | None = None,
    ):
        config = get_config()

        # Override config with explicit parameters
        llm_config = LLMConfig(
            api_key=api_key or config.llm.api_key,
            base_url=base_url or config.llm.base_url,
            model_name=model or config.llm.model_name,
        )

        self.llm = LLMProvider(llm_config)
        self.config = config

    async def predict(
        self,
        seed_text: str,
        num_agents: int = 4,
        rounds: int = 1,
        archetypes: list[str] | None = None,
    ) -> SimulationResult:
        """Run a prediction simulation."""
        sim = Simulation(self.llm)
        return await sim.run(
            seed_text=seed_text,
            num_agents=num_agents,
            num_rounds=rounds,
            archetypes=archetypes,
        )

    async def predict_with_report(
        self,
        seed_text: str,
        num_agents: int = 4,
        rounds: int = 1,
        archetypes: list[str] | None = None,
    ) -> tuple[SimulationResult, str]:
        """Run prediction and generate a report."""
        result = await self.predict(seed_text, num_agents, rounds, archetypes)
        reporter = ReportGenerator(self.llm)
        report = await reporter.generate(result)
        return result, report
