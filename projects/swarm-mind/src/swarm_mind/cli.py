"""SwarmMind CLI - Multi-Agent Prediction Engine."""

import sys
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn

from swarm_mind.core.simulation import SwarmMind
from swarm_mind.report.generator import ReportGenerator

app = typer.Typer(
    name="swarm-mind",
    help="SwarmMind: Multi-Agent Prediction Engine",
    add_completion=False,
)
console = Console()


@app.command()
def predict(
    question: str = typer.Argument(..., help="The prediction question to analyze"),
    agents: int = typer.Option(30, "--agents", "-a", help="Number of agents", min=1, max=500),
    rounds: int = typer.Option(5, "--rounds", "-r", help="Number of simulation rounds", min=1, max=50),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Show detailed output"),
    output: Optional[str] = typer.Option(None, "--output", "-o", help="Output file path"),
):
    """Run a prediction simulation for a given question."""
    console.print(
        Panel(
            f"[bold cyan]SwarmMind Prediction[/bold cyan]\n\n"
            f"[white]{question}[/white]\n\n"
            f"Agents: [green]{agents}[/green] | Rounds: [green]{rounds}[/green]",
            border_style="cyan",
        )
    )

    try:
        engine = SwarmMind()
        result = engine.predict(
            seed_text=question,
            num_agents=agents,
            rounds=rounds,
            verbose=verbose,
        )

        _display_result(result)

        if output:
            _save_report(result, output)

    except KeyboardInterrupt:
        console.print("\n[yellow]Simulation cancelled.[/yellow]")
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"\n[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def simulate(
    seed: str = typer.Option(..., "--seed", "-s", help="Seed text / scenario to simulate"),
    agents: int = typer.Option(50, "--agents", "-a", help="Number of agents", min=1, max=500),
    rounds: int = typer.Option(10, "--rounds", "-r", help="Number of simulation rounds", min=1, max=50),
    output: Optional[str] = typer.Option(None, "--output", "-o", help="Output report file (.md or .json)"),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Show detailed output"),
):
    """Run a detailed simulation with a seed scenario."""
    console.print(
        Panel(
            f"[bold magenta]SwarmMind Simulation[/bold magenta]\n\n"
            f"[white]{seed[:200]}{'...' if len(seed) > 200 else ''}[/white]\n\n"
            f"Agents: [green]{agents}[/green] | Rounds: [green]{rounds}[/green]",
            border_style="magenta",
        )
    )

    try:
        engine = SwarmMind()
        result = engine.simulate(
            scenario=seed,
            agents=agents,
            rounds=rounds,
            output_file=None,  # We handle output ourselves
        )

        _display_result(result)

        if output:
            _save_report(result, output)

    except KeyboardInterrupt:
        console.print("\n[yellow]Simulation cancelled.[/yellow]")
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"\n[red]Error: {e}[/red]")
        raise typer.Exit(1)


def _display_result(result):
    """Display simulation results in the console."""
    sentiment = result.sentiment_distribution
    total = sum(sentiment.values()) or 1

    console.print("\n[bold]Results[/bold]")
    console.print(f"  Actions: [cyan]{result.total_actions}[/cyan]")
    console.print(f"  Duration: [cyan]{result.duration_seconds:.1f}s[/cyan]")

    console.print("\n[bold]Sentiment[/bold]")
    for s, count in sentiment.items():
        pct = count / total * 100
        bar = "█" * int(pct / 3)
        color = {"positive": "green", "negative": "red"}.get(s, "yellow")
        console.print(f"  [{color}]{s:>10}[/{color}] {pct:5.1f}% {bar}")

    if result.top_narratives:
        console.print("\n[bold]Key Narratives[/bold]")
        for n in result.top_narratives[:5]:
            console.print(f"  • {n}")

    if result.emerging_trends:
        console.print("\n[bold]Emerging Trends[/bold]")
        for t in result.emerging_trends[:5]:
            console.print(f"  → {t}")

    console.print()


def _save_report(result, filepath: str):
    """Save report to file."""
    gen = ReportGenerator(result)
    path = Path(filepath)

    if path.suffix == ".json":
        content = gen.format_output("json")
    elif path.suffix == ".txt":
        content = gen.format_output("text")
    else:
        content = gen.format_output("markdown")

    path.write_text(content)
    console.print(f"[green]Report saved to {filepath}[/green]")
