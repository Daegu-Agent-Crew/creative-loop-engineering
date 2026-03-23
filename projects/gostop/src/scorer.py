"""Score calculation for Go-Stop (맞고)."""
from __future__ import annotations

from src.card import HwatuCard, CardType


# Special ribbon month sets
HONGDAN_MONTHS = {1, 2, 3}    # 홍단 (red ribbons)
CHODAN_MONTHS = {4, 5, 7}     # 초단 (grass ribbons)
CHEONGDAN_MONTHS = {6, 9, 10}  # 청단 (blue ribbons)


class Scorer:
    """Calculates Go-Stop scores from captured cards.

    Args:
        captured: List of captured hwatu cards.
    """

    def __init__(self, captured: list[HwatuCard]) -> None:
        """Initialize scorer with captured cards."""
        self.captured = captured
        self._gwang = [c for c in captured if c.card_type == CardType.GWANG]
        self._yeolkkeut = [c for c in captured if c.card_type == CardType.YEOLKKEUT]
        self._tti = [c for c in captured if c.card_type == CardType.TTI]
        self._pi = [c for c in captured if c.card_type == CardType.PI]

    def gwang_score(self) -> int:
        """Calculate gwang (bright) score.

        Returns:
            Score from gwang cards: 5광=15, 4광=4, 3광=3 (2 if includes rain).
        """
        count = len(self._gwang)
        if count < 3:
            return 0
        if count == 5:
            return 15  # 오광
        if count == 4:
            return 4
        # 3 gwang
        has_rain = any(c.month == 12 for c in self._gwang)
        return 2 if has_rain else 3

    def yeolkkeut_score(self) -> int:
        """Calculate yeolkkeut (animal) score.

        Returns:
            Score from animal cards: 1 point per card over 4.
        """
        count = len(self._yeolkkeut)
        return max(0, count - 4)

    def tti_score(self) -> int:
        """Calculate tti (ribbon) base score.

        Returns:
            Score from ribbon cards: 1 point per card over 4.
        """
        count = len(self._tti)
        return max(0, count - 4)

    def pi_score(self) -> int:
        """Calculate pi (junk) score.

        Returns:
            Score from junk cards: 1 point per card over 9.
        """
        count = len(self._pi)
        return max(0, count - 9)

    def cheongdan_score(self) -> int:
        """Calculate 청단 (blue ribbon) bonus score.

        Returns:
            3 points if all three blue ribbons (months 6, 9, 10) are captured.
        """
        tti_months = {c.month for c in self._tti}
        if CHEONGDAN_MONTHS.issubset(tti_months):
            return 3
        return 0

    def hongdan_score(self) -> int:
        """Calculate 홍단 (red ribbon) bonus score.

        Returns:
            3 points if all three red ribbons (months 1, 2, 3) are captured.
        """
        tti_months = {c.month for c in self._tti}
        if HONGDAN_MONTHS.issubset(tti_months):
            return 3
        return 0

    def chodan_score(self) -> int:
        """Calculate 초단 (grass ribbon) bonus score.

        Returns:
            3 points if all three grass ribbons (months 4, 5, 7) are captured.
        """
        tti_months = {c.month for c in self._tti}
        if CHODAN_MONTHS.issubset(tti_months):
            return 3
        return 0

    def total_score(self) -> int:
        """Calculate the total score from all categories.

        Returns:
            Sum of all scoring categories.
        """
        return (
            self.gwang_score()
            + self.yeolkkeut_score()
            + self.tti_score()
            + self.pi_score()
            + self.cheongdan_score()
            + self.hongdan_score()
            + self.chodan_score()
        )
