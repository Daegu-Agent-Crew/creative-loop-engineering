"""Analysis utilities for simulation results."""

from __future__ import annotations

from src.core.simulation import SimulationResult


def sentiment_summary(result: SimulationResult) -> str:
    """Generate a text summary of sentiment distribution."""
    dist = result.sentiment_distribution
    total = sum(dist.values()) or 1
    lines = []
    for sentiment, count in dist.items():
        pct = count / total * 100
        bar = "#" * int(pct / 5)
        lines.append(f"  {sentiment:>8}: {bar} {pct:.0f}% ({count})")
    return "\n".join(lines)


def extract_narratives(result: SimulationResult, top_n: int = 3) -> list[str]:
    """Extract key narrative themes from responses (simple keyword approach)."""
    # Count common significant phrases across all responses
    all_text = " ".join(r.response for r in result.all_responses).lower()

    # Simple approach: find sentences with "will", "predict", "likely", "expect"
    sentences = []
    for r in result.all_responses:
        for sent in r.response.replace("\n", " ").split(". "):
            sent = sent.strip()
            if any(kw in sent.lower() for kw in ["will", "predict", "likely", "expect", "believe"]):
                if 20 < len(sent) < 200:
                    sentences.append(sent)

    # Deduplicate and return top_n
    seen = set()
    unique = []
    for s in sentences:
        key = s[:50].lower()
        if key not in seen:
            seen.add(key)
            unique.append(s)
    return unique[:top_n]
