"""CLI interface for SwarmMind."""

from __future__ import annotations

import asyncio
import sys

import click
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.markdown import Markdown

from src.main import SwarmMind
from src.agents.profiles import AGENT_PROFILES, DEFAULT_AGENTS
from src.report.generator import ReportGenerator
from src.report.analyzer import sentiment_summary

console = Console()


@click.group()
@click.version_option(version="0.1.0")
def cli():
    """SwarmMind - Multi-agent swarm intelligence prediction engine."""
    pass


@cli.command()
@click.argument("question")
@click.option("--agents", "-a", default=4, help="Number of agents to spawn")
@click.option("--rounds", "-r", default=1, help="Number of simulation rounds")
@click.option("--output", "-o", default=None, help="Output file path (markdown)")
@click.option("--archetypes", "-t", default=None, help="Comma-separated agent archetypes")
@click.option("--model", "-m", default=None, help="LLM model name")
@click.option("--base-url", default=None, help="LLM API base URL")
def predict(question: str, agents: int, rounds: int, output: str | None, archetypes: str | None, model: str | None, base_url: str | None):
    """Run a prediction simulation on a question.

    Example: swarm-mind predict "Will AI regulation pass in 2025?"
    """
    archetype_list = archetypes.split(",") if archetypes else None

    console.print(Panel(
        f"[bold cyan]SwarmMind Prediction Engine[/bold cyan]\n\n"
        f"Question: {question}\n"
        f"Agents: {agents}\n"
        f"Rounds: {rounds}\n"
        f"Archetypes: {', '.join(archetype_list or DEFAULT_AGENTS)}",
        title="Configuration",
    ))

    asyncio.run(_run_prediction(question, agents, rounds, output, archetype_list, model, base_url))


async def _run_prediction(
    question: str,
    num_agents: int,
    num_rounds: int,
    output_file: str | None,
    archetypes: list[str] | None,
    model: str | None,
    base_url: str | None,
):
    """Async prediction runner."""
    engine = SwarmMind(model=model, base_url=base_url)

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        # Parse seed
        task = progress.add_task("Parsing seed text...", total=None)
        result, report = await engine.predict_with_report(
            seed_text=question,
            num_agents=num_agents,
            rounds=num_rounds,
            archetypes=archetypes,
        )
        progress.update(task, description="Done!", completed=True)

    # Display results
    console.print()
    console.print(Panel(
        sentiment_summary(result),
        title="Sentiment Distribution",
    ))

    console.print()
    console.print(Markdown(report))

    # Save to file if requested
    if output_file:
        with open(output_file, "w") as f:
            f.write(report)
        console.print(f"\n[green]Report saved to {output_file}[/green]")


@cli.command()
def agents():
    """List available agent archetypes."""
    console.print(Panel("[bold cyan]Available Agent Archetypes[/bold cyan]", title="SwarmMind"))
    for name, profile in AGENT_PROFILES.items():
        default_marker = " [green](default)[/green]" if name in DEFAULT_AGENTS else ""
        console.print(f"\n[bold]{profile.name}[/bold]{default_marker}")
        console.print(f"  {profile.description}")
        console.print(f"  Style: {profile.style}")


if __name__ == "__main__":
    cli()
