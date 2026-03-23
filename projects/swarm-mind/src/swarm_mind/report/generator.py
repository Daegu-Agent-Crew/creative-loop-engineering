"""Report generation for SwarmMind simulations."""

from datetime import datetime
from typing import Any, Dict, Optional

from swarm_mind.core.orchestrator import SimulationResult
from swarm_mind.report.analyzer import ResultAnalyzer


class ReportGenerator:
    """Generates formatted reports from simulation results."""

    def __init__(self, result: SimulationResult):
        self.result = result
        self.analyzer = ResultAnalyzer(result)

    def generate_markdown_report(self) -> str:
        """Generate a complete markdown report."""
        analysis = self.analyzer.full_analysis()
        confidence = analysis["confidence"]
        sentiment = analysis["sentiment_trends"]
        themes = analysis["key_themes"]

        sections = [
            self._header(),
            self._summary_section(confidence, sentiment),
            self._sentiment_section(sentiment),
            self._themes_section(themes),
            self._narratives_section(),
            self._trends_section(),
            self._agents_section(),
            self._confidence_section(confidence),
            self._footer(),
        ]

        return "\n\n".join(sections)

    def enhance_result(self, result=None, parsed_seed=None) -> "SimulationResult":
        """Enhance the simulation result with analysis data."""
        analysis = self.analyzer.full_analysis()
        
        # Add analysis data to result's top_narratives and emerging_trends
        if analysis.get("key_themes"):
            for theme in analysis["key_themes"][:3]:
                theme_text = theme.get("theme", "")
                if theme_text and theme_text not in self.result.top_narratives:
                    self.result.top_narratives.append(theme_text)
        
        if analysis.get("sentiment_trends", {}).get("trend_direction"):
            trend = analysis["sentiment_trends"]["trend_direction"]
            if trend not in self.result.emerging_trends:
                self.result.emerging_trends.append(f"Sentiment trend: {trend}")
        
        return self.result

    def format_output(self, format_type: str = "markdown") -> str:
        """Format output in the requested format."""
        if format_type == "markdown":
            return self.generate_markdown_report()
        elif format_type == "json":
            import json
            return json.dumps(self.enhance_result(), indent=2, default=str)
        elif format_type == "text":
            return self._plain_text_report()
        else:
            return self.generate_markdown_report()

    def _header(self) -> str:
        return f"""# SwarmMind Simulation Report

**Simulation ID:** `{self.result.simulation_id}`
**Question:** {self.result.seed_question}
**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}"""

    def _summary_section(self, confidence: Dict, sentiment: Dict) -> str:
        dominant = sentiment.get("dominant_sentiment", "neutral")
        conf_level = confidence.get("level", "unknown")
        conf_score = confidence.get("score", 0)

        return f"""## Summary

| Metric | Value |
|--------|-------|
| Agents | {self.result.total_agents} |
| Rounds | {self.result.total_rounds} |
| Total Actions | {self.result.total_actions} |
| Duration | {self.result.duration_seconds:.1f}s |
| Dominant Sentiment | {dominant} |
| Confidence | {conf_level} ({conf_score:.1%}) |"""

    def _sentiment_section(self, sentiment: Dict) -> str:
        overall = sentiment.get("overall", {})
        direction = sentiment.get("trend_direction", "stable")

        lines = ["## Sentiment Analysis", ""]
        lines.append(f"**Trend Direction:** {direction.replace('_', ' ').title()}")
        lines.append("")

        if overall:
            total = sum(overall.values()) or 1
            for sent_type, count in sorted(overall.items()):
                pct = count / total * 100
                bar = "█" * int(pct / 5)
                lines.append(f"- **{sent_type.title()}:** {pct:.1f}% {bar}")

        return "\n".join(lines)

    def _themes_section(self, themes) -> str:
        if not themes:
            return "## Key Themes\n\nNo significant themes detected."

        lines = ["## Key Themes", ""]
        for i, theme in enumerate(themes[:8], 1):
            lines.append(
                f"{i}. **{theme['theme']}** (frequency: {theme['frequency']}, "
                f"relevance: {theme['relevance']:.2f})"
            )
        return "\n".join(lines)

    def _narratives_section(self) -> str:
        narratives = self.result.top_narratives
        if not narratives:
            return "## Key Narratives\n\nNo dominant narratives emerged."

        lines = ["## Key Narratives", ""]
        for n in narratives:
            lines.append(f"- {n}")
        return "\n".join(lines)

    def _trends_section(self) -> str:
        trends = self.result.emerging_trends
        if not trends:
            return "## Emerging Trends\n\nNo clear trends detected."

        lines = ["## Emerging Trends", ""]
        for t in trends:
            lines.append(f"- {t}")
        return "\n".join(lines)

    def _agents_section(self) -> str:
        summaries = self.result.agent_summaries
        if not summaries:
            return "## Agent Perspectives\n\nNo agent data available."

        lines = ["## Agent Perspectives", ""]
        for agent in summaries[:10]:
            name = agent.get("name", agent.get("agent_id", "Unknown"))
            archetype = agent.get("archetype", "unknown")
            actions = agent.get("total_actions", 0)
            lines.append(f"- **{name}** ({archetype}): {actions} actions")
        return "\n".join(lines)

    def _confidence_section(self, confidence: Dict) -> str:
        factors = confidence.get("factors", {})
        lines = ["## Confidence Assessment", ""]
        lines.append(
            f"**Overall Confidence:** {confidence['level'].title()} "
            f"({confidence['score']:.1%})"
        )
        lines.append("")

        if factors:
            lines.append("| Factor | Score |")
            lines.append("|--------|-------|")
            for factor, score in factors.items():
                label = factor.replace("_", " ").title()
                lines.append(f"| {label} | {score:.1%} |")

        return "\n".join(lines)

    def _footer(self) -> str:
        return """---

*Generated by [SwarmMind](https://github.com/swarm-mind) - Multi-Agent Prediction Engine*"""

    def _plain_text_report(self) -> str:
        """Generate a simple plain text report."""
        r = self.result
        lines = [
            f"SwarmMind Simulation Report",
            f"{'=' * 40}",
            f"Question: {r.seed_question}",
            f"Agents: {r.total_agents} | Rounds: {r.total_rounds} | Actions: {r.total_actions}",
            f"Duration: {r.duration_seconds:.1f}s",
            "",
            "Sentiment Distribution:",
        ]

        total = sum(r.sentiment_distribution.values()) or 1
        for s, c in r.sentiment_distribution.items():
            lines.append(f"  {s}: {c / total * 100:.1f}%")

        if r.top_narratives:
            lines.append("\nKey Narratives:")
            for n in r.top_narratives:
                lines.append(f"  - {n}")

        if r.emerging_trends:
            lines.append("\nEmerging Trends:")
            for t in r.emerging_trends:
                lines.append(f"  - {t}")

        return "\n".join(lines)
