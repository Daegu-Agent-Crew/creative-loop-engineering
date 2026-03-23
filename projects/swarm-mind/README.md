# SwarmMind

Multi-Agent Prediction Engine — harness collective intelligence from diverse AI agents to analyze scenarios and generate predictions.

## Installation

```bash
# Clone the repository
git clone https://github.com/swarm-mind/swarm-mind.git
cd swarm-mind

# Install with pip
pip install -e .

# Or install dependencies directly
pip install -r requirements.txt
```

## Configuration

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

SwarmMind uses the OpenAI-compatible API. You can point it at any compatible provider by changing `OPENAI_BASE_URL`.

## Usage

### CLI

**Quick prediction:**

```bash
swarm-mind predict "Will AI replace most software engineering jobs by 2030?" --agents 30 --rounds 5
```

**Detailed simulation:**

```bash
swarm-mind simulate --seed "Global semiconductor shortage impact on tech industry" --agents 50 --rounds 10 --output report.md
```

**Options:**

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--agents` | `-a` | Number of agents | 30 (predict) / 50 (simulate) |
| `--rounds` | `-r` | Simulation rounds | 5 (predict) / 10 (simulate) |
| `--output` | `-o` | Output file (.md, .json, .txt) | None |
| `--verbose` | `-v` | Detailed output | False |

### Python API

```python
from swarm_mind import SimulationEngine

engine = SimulationEngine()

# Quick prediction
result = engine.predict(
    seed_text="Will renewable energy surpass fossil fuels by 2035?",
    num_agents=30,
    rounds=5,
)

print(result.sentiment_distribution)
print(result.top_narratives)
print(result.emerging_trends)

# Save results
SimulationEngine.save_result(result, "output.json")
```

### Report Generation

```python
from swarm_mind.report import ReportGenerator

gen = ReportGenerator(result)

# Markdown report
report = gen.generate_markdown_report()

# Enhanced result with analysis
enhanced = gen.enhance_result()

# Analysis only
from swarm_mind.report import ResultAnalyzer

analyzer = ResultAnalyzer(result)
confidence = analyzer.calculate_confidence()
themes = analyzer.extract_key_themes()
trends = analyzer.analyze_sentiment_trends()
```

## Architecture

SwarmMind spawns a diverse swarm of AI agents — each with a unique archetype (Analyst, Skeptic, Expert, Journalist, Activist, Policymaker, Optimist, Pessimist) — and runs them through multiple rounds of analysis and interaction.

```
Seed Text → Parser → Knowledge Graph → Orchestrator → Agents (rounds) → Analysis → Report
```

**Core modules:**

- `core/seed_parser.py` — Extract entities, events, and context from input
- `core/knowledge_graph.py` — NetworkX-based graph for entity relationships
- `core/orchestrator.py` — Manages agent lifecycle and simulation rounds
- `core/simulation.py` — High-level engine API
- `agents/base.py` — Base agent with LLM integration
- `agents/profiles.py` — Agent archetypes and personality generation
- `report/analyzer.py` — Sentiment trends, themes, and confidence scoring
- `report/generator.py` — Markdown/JSON/text report generation

## License

MIT
