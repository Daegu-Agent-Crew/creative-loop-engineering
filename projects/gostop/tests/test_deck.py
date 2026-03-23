"""Tests for Deck management."""
import pytest
from src.deck import Deck
from src.card import CardType


class TestDeck:
    """Tests for Deck class."""

    def test_create_deck(self) -> None:
        """A new deck should contain 48 cards."""
        deck = Deck()
        assert len(deck) == 48

    def test_shuffle(self) -> None:
        """Shuffling should change card order (with very high probability)."""
        deck1 = Deck()
        cards_before = list(deck1.cards)
        deck1.shuffle()
        # Extremely unlikely to be the same after shuffle
        assert deck1.cards != cards_before

    def test_draw(self) -> None:
        """Drawing should remove and return the top card."""
        deck = Deck()
        deck.shuffle()
        initial_len = len(deck)
        card = deck.draw()
        assert card is not None
        assert len(deck) == initial_len - 1

    def test_draw_empty(self) -> None:
        """Drawing from empty deck should return None."""
        deck = Deck()
        for _ in range(48):
            deck.draw()
        assert deck.draw() is None

    def test_deal(self) -> None:
        """Dealing should distribute cards to players and field."""
        deck = Deck()
        deck.shuffle()
        hand1, hand2, field = deck.deal(hand_size=10, field_size=8)
        assert len(hand1) == 10
        assert len(hand2) == 10
        assert len(field) == 8
        assert len(deck) == 20  # 48 - 10 - 10 - 8

    def test_deal_insufficient_cards(self) -> None:
        """Dealing more cards than available should raise ValueError."""
        deck = Deck()
        with pytest.raises(ValueError):
            deck.deal(hand_size=20, field_size=20)

    def test_is_empty(self) -> None:
        """is_empty should return True when no cards remain."""
        deck = Deck()
        assert not deck.is_empty()
        for _ in range(48):
            deck.draw()
        assert deck.is_empty()

    def test_all_unique_after_create(self) -> None:
        """All cards in a new deck should be unique."""
        deck = Deck()
        assert len(set(deck.cards)) == 48
