"""Game logic for Go-Stop (맞고)."""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

from src.card import HwatuCard
from src.deck import Deck
from src.scorer import Scorer


class GameState(Enum):
    """States of the game."""
    NOT_STARTED = "not_started"
    PLAYING = "playing"
    FINISHED = "finished"


class PlayerAction(Enum):
    """Possible player actions."""
    PLAY_CARD = "play_card"
    GO = "go"
    STOP = "stop"


@dataclass
class Player:
    """A Go-Stop player.

    Attributes:
        hand: Cards in the player's hand.
        captured: Cards the player has captured.
        go_count: Number of times the player has declared 'go'.
        can_declare_go_stop: Whether the player can currently declare go/stop.
    """
    hand: list[HwatuCard] = field(default_factory=list)
    captured: list[HwatuCard] = field(default_factory=list)
    go_count: int = 0
    can_declare_go_stop: bool = False

    def score(self) -> int:
        """Calculate this player's current score.

        Returns:
            The total score from captured cards.
        """
        return Scorer(self.captured).total_score()


class GoStopGame:
    """Main game controller for Go-Stop (맞고).

    Manages the game state, turn order, card matching, and win conditions.
    """

    def __init__(self) -> None:
        """Initialize a new game."""
        self.state: GameState = GameState.NOT_STARTED
        self.players: list[Player] = [Player(), Player()]
        self.field: list[HwatuCard] = []
        self.deck: Deck = Deck()
        self.current_player_index: int = 0
        self.winner: Optional[int] = None

    def start(self) -> None:
        """Start the game by shuffling and dealing cards."""
        self.deck.shuffle()
        hand1, hand2, self.field = self.deck.deal(hand_size=10, field_size=8)
        self.players[0].hand = hand1
        self.players[1].hand = hand2
        self.state = GameState.PLAYING
        self.current_player_index = 0

    def play_card(self, card: HwatuCard) -> list[HwatuCard]:
        """Play a card from the current player's hand.

        This performs the full turn: play card, match on field, draw from deck,
        match again, then switch turns.

        Args:
            card: The card to play from hand.

        Returns:
            List of cards captured this turn.

        Raises:
            ValueError: If the card is not in the player's hand.
        """
        player = self.players[self.current_player_index]
        if card not in player.hand:
            raise ValueError(f"Card {card} not in player's hand")

        player.hand.remove(card)
        captured: list[HwatuCard] = []

        # Phase 1: Match played card with field
        matching_field = [c for c in self.field if c.month == card.month]

        if len(matching_field) == 1:
            # Capture the pair
            captured.append(card)
            captured.append(matching_field[0])
            self.field.remove(matching_field[0])
        elif len(matching_field) == 2:
            # Player chooses one to match (take first for simplicity)
            captured.append(card)
            captured.append(matching_field[0])
            self.field.remove(matching_field[0])
        elif len(matching_field) == 3:
            # Capture all three plus played card
            captured.append(card)
            for c in matching_field:
                captured.append(c)
                self.field.remove(c)
        else:
            # No match: card goes to field
            self.field.append(card)

        # Phase 2: Draw from deck and match
        drawn = self.deck.draw()
        if drawn is not None:
            drawn_matching = [c for c in self.field if c.month == drawn.month]

            if len(drawn_matching) == 1:
                captured.append(drawn)
                captured.append(drawn_matching[0])
                self.field.remove(drawn_matching[0])
            elif len(drawn_matching) == 2:
                captured.append(drawn)
                captured.append(drawn_matching[0])
                self.field.remove(drawn_matching[0])
            elif len(drawn_matching) == 3:
                captured.append(drawn)
                for c in drawn_matching:
                    captured.append(c)
                    self.field.remove(c)
            else:
                self.field.append(drawn)

        # Add captured cards to player
        player.captured.extend(captured)

        # Check if player can declare go/stop
        if player.score() >= 3 and player.go_count == 0:
            player.can_declare_go_stop = True
        elif player.score() >= 3 + player.go_count and player.go_count > 0:
            player.can_declare_go_stop = True

        # Switch turns
        self.current_player_index = 1 - self.current_player_index

        # Check game end
        self.check_game_end()

        return captured

    def declare_go(self, player_index: int) -> bool:
        """Declare 'go' for the specified player.

        Args:
            player_index: Index of the player (0 or 1).

        Returns:
            True if go was successfully declared.
        """
        player = self.players[player_index]
        if not player.can_declare_go_stop:
            return False

        player.go_count += 1
        player.can_declare_go_stop = False

        if player.go_count >= 3:
            self.state = GameState.FINISHED
            self.winner = player_index

        return True

    def declare_stop(self, player_index: int) -> bool:
        """Declare 'stop' for the specified player, ending the game.

        Args:
            player_index: Index of the player (0 or 1).

        Returns:
            True if stop was successfully declared.
        """
        player = self.players[player_index]
        if not player.can_declare_go_stop:
            return False

        self.state = GameState.FINISHED
        self.winner = player_index
        player.can_declare_go_stop = False
        return True

    def check_game_end(self) -> None:
        """Check if the game should end (deck exhausted or hands empty)."""
        if self.deck.is_empty() or all(len(p.hand) == 0 for p in self.players):
            self.state = GameState.FINISHED
            # Determine winner by score
            s0 = self.players[0].score()
            s1 = self.players[1].score()
            if s0 > s1:
                self.winner = 0
            elif s1 > s0:
                self.winner = 1
            else:
                self.winner = 0  # Player 0 wins ties (선)
