"""Deck management for Go-Stop (맞고)."""
from __future__ import annotations

import random
from src.card import HwatuCard, HWATU_CARDS


class Deck:
    """A deck of 48 hwatu cards with shuffle, draw, and deal operations.

    Attributes:
        cards: The list of cards currently in the deck.
    """

    def __init__(self) -> None:
        """Create a new deck with all 48 hwatu cards."""
        self.cards: list[HwatuCard] = list(HWATU_CARDS)

    def __len__(self) -> int:
        """Return the number of cards remaining in the deck."""
        return len(self.cards)

    def shuffle(self) -> None:
        """Shuffle the deck in place."""
        random.shuffle(self.cards)

    def draw(self) -> HwatuCard | None:
        """Draw the top card from the deck.

        Returns:
            The top card, or None if the deck is empty.
        """
        if not self.cards:
            return None
        return self.cards.pop()

    def deal(self, hand_size: int = 10, field_size: int = 8) -> tuple[list[HwatuCard], list[HwatuCard], list[HwatuCard]]:
        """Deal cards to two players and the field.

        Args:
            hand_size: Number of cards per player hand.
            field_size: Number of cards on the field.

        Returns:
            Tuple of (player1_hand, player2_hand, field_cards).

        Raises:
            ValueError: If there aren't enough cards to deal.
        """
        total_needed = hand_size * 2 + field_size
        if len(self.cards) < total_needed:
            raise ValueError(f"Need {total_needed} cards but only {len(self.cards)} remain")

        hand1 = [self.cards.pop() for _ in range(hand_size)]
        hand2 = [self.cards.pop() for _ in range(hand_size)]
        field = [self.cards.pop() for _ in range(field_size)]
        return hand1, hand2, field

    def is_empty(self) -> bool:
        """Check if the deck has no cards remaining.

        Returns:
            True if no cards remain.
        """
        return len(self.cards) == 0
