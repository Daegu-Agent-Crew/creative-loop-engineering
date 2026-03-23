"""Tests for HwatuCard class."""
import pytest
from src.card import HwatuCard, CardType, HWATU_CARDS


class TestCardType:
    """Tests for CardType enum."""

    def test_card_types_exist(self) -> None:
        """All four card types should exist."""
        assert CardType.GWANG  # 광
        assert CardType.YEOLKKEUT  # 열끗 (animal)
        assert CardType.TTI  # 띠 (ribbon)
        assert CardType.PI  # 피 (junk)


class TestHwatuCard:
    """Tests for HwatuCard class."""

    def test_create_card(self) -> None:
        """Should create a card with month, type, and name."""
        card = HwatuCard(month=1, card_type=CardType.GWANG, name="송학")
        assert card.month == 1
        assert card.card_type == CardType.GWANG
        assert card.name == "송학"

    def test_card_str(self) -> None:
        """String representation should include month, name, and type."""
        card = HwatuCard(month=1, card_type=CardType.GWANG, name="송학")
        s = str(card)
        assert "1월" in s
        assert "송학" in s

    def test_card_equality(self) -> None:
        """Cards with same month, type, and name should be equal."""
        c1 = HwatuCard(month=1, card_type=CardType.GWANG, name="송학")
        c2 = HwatuCard(month=1, card_type=CardType.GWANG, name="송학")
        assert c1 == c2

    def test_card_inequality(self) -> None:
        """Cards with different attributes should not be equal."""
        c1 = HwatuCard(month=1, card_type=CardType.GWANG, name="송학")
        c2 = HwatuCard(month=1, card_type=CardType.TTI, name="홍단")
        assert c1 != c2

    def test_card_hash(self) -> None:
        """Equal cards should have the same hash."""
        c1 = HwatuCard(month=1, card_type=CardType.GWANG, name="송학")
        c2 = HwatuCard(month=1, card_type=CardType.GWANG, name="송학")
        assert hash(c1) == hash(c2)

    def test_month_range(self) -> None:
        """Month must be between 1 and 12."""
        with pytest.raises(ValueError):
            HwatuCard(month=0, card_type=CardType.PI, name="test")
        with pytest.raises(ValueError):
            HwatuCard(month=13, card_type=CardType.PI, name="test")


class TestHwatuCards:
    """Tests for the full set of 48 hwatu cards."""

    def test_total_cards(self) -> None:
        """There should be exactly 48 cards."""
        assert len(HWATU_CARDS) == 48

    def test_four_per_month(self) -> None:
        """Each month should have exactly 4 cards."""
        for month in range(1, 13):
            cards = [c for c in HWATU_CARDS if c.month == month]
            assert len(cards) == 4, f"Month {month} has {len(cards)} cards"

    def test_all_cards_unique(self) -> None:
        """All 48 cards should be unique."""
        assert len(set(HWATU_CARDS)) == 48

    def test_gwang_count(self) -> None:
        """There should be exactly 5 gwang cards (months 1, 3, 8, 11, 12)."""
        gwang = [c for c in HWATU_CARDS if c.card_type == CardType.GWANG]
        assert len(gwang) == 5
        gwang_months = {c.month for c in gwang}
        assert gwang_months == {1, 3, 8, 11, 12}

    def test_tti_count(self) -> None:
        """There should be exactly 10 ribbon cards."""
        tti = [c for c in HWATU_CARDS if c.card_type == CardType.TTI]
        assert len(tti) == 10

    def test_yeolkkeut_count(self) -> None:
        """There should be exactly 9 animal cards."""
        yeolkkeut = [c for c in HWATU_CARDS if c.card_type == CardType.YEOLKKEUT]
        assert len(yeolkkeut) == 9

    def test_pi_count(self) -> None:
        """There should be exactly 24 pi cards."""
        pi = [c for c in HWATU_CARDS if c.card_type == CardType.PI]
        assert len(pi) == 24
