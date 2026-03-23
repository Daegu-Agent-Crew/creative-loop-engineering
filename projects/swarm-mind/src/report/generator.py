"""Report generator - creates markdown reports from simulation results."""

from __future__ import annotations

from src.core.simulation import SimulationResult
from src.llm.provider import LLMProvider
from src.llm.prompts import REPORT_PROMPT
from src.report.analyzer import sentiment_summary, extract_narratives


class ReportGenerator:
    """Generates structured reports from simulation results."""

    def __init__(self, llm: LLMProvider | None = None):
        self.llm = llm

    async def generate(self, result: SimulationResult) -> str:
        """Generate a full report, optionally using LLM for synthesis."""
        if self.llm:
            return await self._llm_report(result)
        return self._static_report(result)

    async def _llm_report(self, result: SimulationResult) -> str:
        """Generate report using LLM synthesis."""
        analyses = "\n\n".join(
            f"**{r.agent_name}** ({r.archetype}, sentiment: {r.sentiment}):\n{r.response}"
            for r in result.all_responses
        )
        prompt = REPORT_PROMPT.format(
            topic=result.seed_data.key_question or result.seed_data.context,
            analyses=analyses,
        )
        report = await self.llm.complete(
            system_prompt=prompt,
            user_prompt="Generate the report now.",
            temperature=0.4,
        )
        return report

    def _static_report(self, result: SimulationResult) -> str:
        """Generate a static report without LLM."""
        lines = [
            "# SwarmMind Prediction Report",
            "",
            f"## Topic",
            f"{result.seed_data.key_question or result.seed_data.context}",
            "",
            f"## Simulation Parameters",
            f"- Agents: {result.total_agents}",
            f"- Rounds: {result.total_rounds}",
            "",
            "## Sentiment Distribution",
            sentiment_summary(result),
            "",
            "## Key Narratives",
        ]

        narratives = extract_narratives(result)
        for i, n in enumerate(narratives, 1):
            lines.append(f"{i}. {n}")

        lines.extend([
            "",
            "## Agent Responses",
        ])
        for r in result.all_responses:
            lines.extend([
                f"### {r.agent_name} ({r.archetype})",
                f"*Sentiment: {r.sentiment} | Confidence: {r.confidence}*",
                "",
                r.response,
                "",
            ])

        return "\n".join(lines)
