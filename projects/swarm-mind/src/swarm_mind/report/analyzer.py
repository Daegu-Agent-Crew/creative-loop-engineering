"""Result analysis for SwarmMind simulations."""

from collections import Counter
from typing import Any, Dict, List, Optional

from swarm_mind.core.orchestrator import SimulationResult


class ResultAnalyzer:
    """Analyzes simulation results for trends, themes, and confidence."""

    def __init__(self, result: SimulationResult):
        self.result = result

    def analyze_sentiment_trends(self) -> Dict[str, Any]:
        """Analyze how sentiment evolved across simulation rounds."""
        rounds: Dict[int, List[str]] = {}

        for action in self.result.actions_log:
            rnd = action.get("round_number", 0)
            sentiment = action.get("sentiment", "neutral")
            rounds.setdefault(rnd, []).append(sentiment)

        trends = {}
        for rnd, sentiments in sorted(rounds.items()):
            counts = Counter(sentiments)
            total = len(sentiments)
            trends[rnd] = {
                "positive": counts.get("positive", 0) / total,
                "negative": counts.get("negative", 0) / total,
                "neutral": counts.get("neutral", 0) / total,
                "total_actions": total,
            }

        overall = self.result.sentiment_distribution
        dominant = max(overall, key=overall.get) if overall else "neutral"

        return {
            "per_round": trends,
            "overall": overall,
            "dominant_sentiment": dominant,
            "trend_direction": self._detect_trend_direction(trends),
        }

    def extract_key_themes(self, max_themes: int = 10) -> List[Dict[str, Any]]:
        """Extract key themes from agent actions and narratives."""
        word_freq: Counter = Counter()

        for action in self.result.actions_log:
            content = action.get("content", "")
            words = [
                w.lower().strip(".,!?;:\"'()[]")
                for w in content.split()
                if len(w) > 4
            ]
            word_freq.update(words)

        # Remove common stop words
        stop_words = {
            "about", "would", "could", "should", "their", "there",
            "these", "those", "which", "where", "while", "being",
            "might", "other", "after", "before", "between", "through",
            "during", "without", "within", "along", "since", "until",
        }
        for sw in stop_words:
            word_freq.pop(sw, None)

        themes = []
        for word, count in word_freq.most_common(max_themes):
            themes.append({
                "theme": word,
                "frequency": count,
                "relevance": min(1.0, count / max(len(self.result.actions_log), 1)),
            })

        return themes

    def calculate_confidence(self) -> Dict[str, Any]:
        """Calculate confidence score for the simulation results."""
        agent_count = self.result.total_agents
        round_count = self.result.total_rounds
        action_count = self.result.total_actions

        # More agents and rounds = higher confidence
        agent_factor = min(1.0, agent_count / 50)
        round_factor = min(1.0, round_count / 10)
        action_factor = min(1.0, action_count / 200)

        # Sentiment agreement boosts confidence
        sentiment = self.result.sentiment_distribution
        total_sent = sum(sentiment.values()) or 1
        max_sent = max(sentiment.values()) if sentiment else 0
        agreement = max_sent / total_sent

        score = (
            agent_factor * 0.25
            + round_factor * 0.20
            + action_factor * 0.20
            + agreement * 0.35
        )

        level = "low"
        if score >= 0.7:
            level = "high"
        elif score >= 0.4:
            level = "medium"

        return {
            "score": round(score, 3),
            "level": level,
            "factors": {
                "agent_diversity": round(agent_factor, 3),
                "simulation_depth": round(round_factor, 3),
                "data_volume": round(action_factor, 3),
                "sentiment_agreement": round(agreement, 3),
            },
        }

    def full_analysis(self) -> Dict[str, Any]:
        """Run all analyses and return combined results."""
        return {
            "sentiment_trends": self.analyze_sentiment_trends(),
            "key_themes": self.extract_key_themes(),
            "confidence": self.calculate_confidence(),
            "narratives": self.result.top_narratives,
            "emerging_trends": self.result.emerging_trends,
        }

    def _detect_trend_direction(self, trends: Dict[int, Dict]) -> str:
        """Detect if sentiment is trending positive, negative, or stable."""
        if len(trends) < 2:
            return "insufficient_data"

        rounds = sorted(trends.keys())
        first_half = rounds[: len(rounds) // 2]
        second_half = rounds[len(rounds) // 2 :]

        def avg_positive(rnds):
            vals = [trends[r]["positive"] for r in rnds]
            return sum(vals) / len(vals) if vals else 0

        early = avg_positive(first_half)
        late = avg_positive(second_half)
        diff = late - early

        if diff > 0.1:
            return "increasingly_positive"
        elif diff < -0.1:
            return "increasingly_negative"
        return "stable"
