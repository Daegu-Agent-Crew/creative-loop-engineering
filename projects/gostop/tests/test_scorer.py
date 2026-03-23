"""Tests for score calculation."""
import pytest
from src.scorer import Scorer
from src.card import HwatuCard, CardType, HWATU_CARDS


def cards_of_type(card_type: CardType, count: int) -> list[HwatuCard]:
    """Get the first N cards of a given type from the full set."""
    return [c for c in HWATU_CARDS if c.card_type == card_type][:count]


def cards_by_months_and_type(months: list[int], card_type: CardType) -> list[HwatuCard]:
    """Get cards of a specific type from specific months."""
    return [c for c in HWATU_CARDS if c.month in months and c.card_type == card_type]


class TestGwangScore:
    """Tests for gwang (bright) scoring."""

    def test_no_gwang(self) -> None:
        """No gwang cards should give 0 points."""
        scorer = Scorer(captured=[])
        assert scorer.gwang_score() == 0

    def test_two_gwang(self) -> None:
        """Two gwang should give 0 points."""
        cards = cards_of_type(CardType.GWANG, 2)
        scorer = Scorer(captured=cards)
        assert scorer.gwang_score() == 0

    def test_three_gwang(self) -> None:
        """Three gwang should give 3 points."""
        cards = cards_of_type(CardType.GWANG, 3)
        scorer = Scorer(captured=cards)
        assert scorer.gwang_score() == 3

    def test_four_gwang(self) -> None:
        """Four gwang should give 4 points."""
        cards = cards_of_type(CardType.GWANG, 4)
        scorer = Scorer(captured=cards)
        assert scorer.gwang_score() == 4

    def test_five_gwang(self) -> None:
        """Five gwang (오광) should give 15 points."""
        cards = cards_of_type(CardType.GWANG, 5)
        scorer = Scorer(captured=cards)
        assert scorer.gwang_score() == 15

    def test_three_gwang_with_rain(self) -> None:
        """Three gwang including rain (12월) should give 2 points."""
        # Get rain gwang (month 12) plus 2 others
        rain = [c for c in HWATU_CARDS if c.month == 12 and c.card_type == CardType.GWANG][0]
        others = [c for c in HWATU_CARDS if c.card_type == CardType.GWANG and c.month != 12][:2]
        scorer = Scorer(captured=[rain] + others)
        assert scorer.gwang_score() == 2


class TestYeolkkeutScore:
    """Tests for yeolkkeut (animal) scoring."""

    def test_no_yeolkkeut(self) -> None:
        """No animal cards should give 0 points."""
        scorer = Scorer(captured=[])
        assert scorer.yeolkkeut_score() == 0

    def test_four_yeolkkeut(self) -> None:
        """Four animal cards should give 0 points."""
        cards = cards_of_type(CardType.YEOLKKEUT, 4)
        scorer = Scorer(captured=cards)
        assert scorer.yeolkkeut_score() == 0

    def test_five_yeolkkeut(self) -> None:
        """Five animal cards should give 1 point."""
        cards = cards_of_type(CardType.YEOLKKEUT, 5)
        scorer = Scorer(captured=cards)
        assert scorer.yeolkkeut_score() == 1

    def test_seven_yeolkkeut(self) -> None:
        """Seven animal cards should give 3 points."""
        cards = cards_of_type(CardType.YEOLKKEUT, 7)
        scorer = Scorer(captured=cards)
        assert scorer.yeolkkeut_score() == 3


class TestTtiScore:
    """Tests for tti (ribbon) scoring."""

    def test_no_tti(self) -> None:
        """No ribbon cards should give 0 points."""
        scorer = Scorer(captured=[])
        assert scorer.tti_score() == 0

    def test_four_tti(self) -> None:
        """Four ribbon cards should give 0 points."""
        cards = cards_of_type(CardType.TTI, 4)
        scorer = Scorer(captured=cards)
        assert scorer.tti_score() == 0

    def test_five_tti(self) -> None:
        """Five ribbon cards should give 1 point."""
        cards = cards_of_type(CardType.TTI, 5)
        scorer = Scorer(captured=cards)
        assert scorer.tti_score() == 1

    def test_eight_tti(self) -> None:
        """Eight ribbon cards should give 4 points."""
        cards = cards_of_type(CardType.TTI, 8)
        scorer = Scorer(captured=cards)
        assert scorer.tti_score() == 4


class TestPiScore:
    """Tests for pi (junk) scoring."""

    def test_no_pi(self) -> None:
        """No junk cards should give 0 points."""
        scorer = Scorer(captured=[])
        assert scorer.pi_score() == 0

    def test_nine_pi(self) -> None:
        """Nine junk cards should give 0 points."""
        cards = cards_of_type(CardType.PI, 9)
        scorer = Scorer(captured=cards)
        assert scorer.pi_score() == 0

    def test_ten_pi(self) -> None:
        """Ten junk cards should give 1 point."""
        cards = cards_of_type(CardType.PI, 10)
        scorer = Scorer(captured=cards)
        assert scorer.pi_score() == 1

    def test_fifteen_pi(self) -> None:
        """Fifteen junk cards should give 6 points."""
        cards = cards_of_type(CardType.PI, 15)
        scorer = Scorer(captured=cards)
        assert scorer.pi_score() == 6


class TestSpecialCombinations:
    """Tests for special scoring combinations."""

    def test_cheongdan(self) -> None:
        """청단 (blue ribbons from months 6, 9, 10) should give 3 points."""
        cards = cards_by_months_and_type([6, 9, 10], CardType.TTI)
        scorer = Scorer(captured=cards)
        assert scorer.cheongdan_score() == 3

    def test_hongdan(self) -> None:
        """홍단 (red ribbons from months 1, 2, 3) should give 3 points."""
        cards = cards_by_months_and_type([1, 2, 3], CardType.TTI)
        scorer = Scorer(captured=cards)
        assert scorer.hongdan_score() == 3

    def test_chodan(self) -> None:
        """초단 (grass ribbons from months 4, 5, 7) should give 3 points."""
        cards = cards_by_months_and_type([4, 5, 7], CardType.TTI)
        scorer = Scorer(captured=cards)
        assert scorer.chodan_score() == 3

    def test_no_cheongdan(self) -> None:
        """Missing one blue ribbon should give 0 points."""
        cards = cards_by_months_and_type([6, 9], CardType.TTI)
        scorer = Scorer(captured=cards)
        assert scorer.cheongdan_score() == 0


class TestTotalScore:
    """Tests for total score calculation."""

    def test_empty_score(self) -> None:
        """No captured cards should give 0 total score."""
        scorer = Scorer(captured=[])
        assert scorer.total_score() == 0

    def test_combined_score(self) -> None:
        """Total score should sum all category scores."""
        # Get 3 gwang (3pts) + enough pi for 1pt = 4pts minimum
        gwang = cards_of_type(CardType.GWANG, 3)
        # Exclude rain gwang for clean 3pts
        gwang = [c for c in HWATU_CARDS if c.card_type == CardType.GWANG and c.month != 12][:3]
        pi = cards_of_type(CardType.PI, 10)
        scorer = Scorer(captured=gwang + pi)
        total = scorer.total_score()
        assert total >= 4  # At least 3 (gwang) + 1 (pi)
