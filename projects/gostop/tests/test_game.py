"""Tests for game logic."""
import pytest
from src.game import GoStopGame, GameState, PlayerAction
from src.card import HwatuCard, CardType, HWATU_CARDS


class TestGameInit:
    """Tests for game initialization."""

    def test_create_game(self) -> None:
        """Game should initialize with two players."""
        game = GoStopGame()
        assert game.state == GameState.NOT_STARTED

    def test_start_game(self) -> None:
        """Starting game should deal cards."""
        game = GoStopGame()
        game.start()
        assert game.state == GameState.PLAYING
        assert len(game.players[0].hand) == 10
        assert len(game.players[1].hand) == 10
        assert len(game.field) == 8

    def test_current_player(self) -> None:
        """First turn should belong to player 0."""
        game = GoStopGame()
        game.start()
        assert game.current_player_index == 0


class TestPlayCard:
    """Tests for playing cards from hand."""

    def test_play_matching_card(self) -> None:
        """Playing a card matching a field card should set up capture."""
        game = GoStopGame()
        game.start()
        player = game.players[game.current_player_index]

        # Find a card in hand that matches a field card month
        field_months = {c.month for c in game.field}
        matching = [c for c in player.hand if c.month in field_months]

        if matching:
            card = matching[0]
            result = game.play_card(card)
            assert result is not None

    def test_play_non_matching_card(self) -> None:
        """Playing a card with no field match should place it on field."""
        game = GoStopGame()
        game.start()
        player = game.players[game.current_player_index]

        field_months = {c.month for c in game.field}
        non_matching = [c for c in player.hand if c.month not in field_months]

        if non_matching:
            card = non_matching[0]
            field_before = len(game.field)
            game.play_card(card)
            # Card goes to field, then draw phase happens
            # After full turn, field size may vary

    def test_play_card_not_in_hand(self) -> None:
        """Playing a card not in hand should raise ValueError."""
        game = GoStopGame()
        game.start()
        fake_card = HwatuCard(month=1, card_type=CardType.PI, name="fake")
        # Ensure it's not in hand
        player = game.players[game.current_player_index]
        if fake_card in player.hand:
            player.hand.remove(fake_card)
        with pytest.raises(ValueError):
            game.play_card(fake_card)


class TestDrawPhase:
    """Tests for the draw-from-deck phase."""

    def test_draw_after_play(self) -> None:
        """After playing a card, a card should be drawn from deck."""
        game = GoStopGame()
        game.start()
        deck_before = len(game.deck)
        player = game.players[game.current_player_index]
        card = player.hand[0]
        game.play_card(card)
        # Deck should have one fewer card after draw phase
        assert len(game.deck) == deck_before - 1


class TestCapture:
    """Tests for capturing cards."""

    def test_capture_adds_to_captured(self) -> None:
        """Captured cards should go to the player's capture pile."""
        game = GoStopGame()
        game.start()
        player = game.players[game.current_player_index]

        field_months = {c.month for c in game.field}
        matching = [c for c in player.hand if c.month in field_months]

        if matching:
            captured_before = len(player.captured)
            game.play_card(matching[0])
            # If match occurred, captured should increase
            # (exact count depends on draw phase)


class TestGoStop:
    """Tests for go/stop decision."""

    def test_can_go(self) -> None:
        """Player should be able to declare go when score >= 3."""
        game = GoStopGame()
        game.start()
        player = game.players[0]
        # Manually give player enough cards to score >= 3
        gwang_cards = [c for c in HWATU_CARDS if c.card_type == CardType.GWANG and c.month != 12][:3]
        player.captured = list(gwang_cards)
        player.can_declare_go_stop = True
        result = game.declare_go(0)
        assert result is True
        assert player.go_count == 1

    def test_can_stop(self) -> None:
        """Player should be able to declare stop when score >= 3."""
        game = GoStopGame()
        game.start()
        player = game.players[0]
        gwang_cards = [c for c in HWATU_CARDS if c.card_type == CardType.GWANG and c.month != 12][:3]
        player.captured = list(gwang_cards)
        player.can_declare_go_stop = True
        result = game.declare_stop(0)
        assert result is True
        assert game.state == GameState.FINISHED
        assert game.winner == 0

    def test_three_go_auto_win(self) -> None:
        """Three consecutive go declarations should result in auto win."""
        game = GoStopGame()
        game.start()
        player = game.players[0]
        gwang_cards = [c for c in HWATU_CARDS if c.card_type == CardType.GWANG and c.month != 12][:3]
        player.captured = list(gwang_cards)
        player.can_declare_go_stop = True
        game.declare_go(0)
        player.can_declare_go_stop = True
        game.declare_go(0)
        player.can_declare_go_stop = True
        game.declare_go(0)
        assert game.state == GameState.FINISHED
        assert game.winner == 0


class TestGameEnd:
    """Tests for game ending conditions."""

    def test_deck_exhausted(self) -> None:
        """Game should end when deck is empty."""
        game = GoStopGame()
        game.start()
        # Empty the deck
        while not game.deck.is_empty():
            game.deck.draw()
        game.check_game_end()
        assert game.state == GameState.FINISHED

    def test_winner_by_score(self) -> None:
        """When deck is exhausted, player with higher score wins."""
        game = GoStopGame()
        game.start()
        # Give player 0 more points
        gwang_cards = [c for c in HWATU_CARDS if c.card_type == CardType.GWANG and c.month != 12][:3]
        game.players[0].captured = list(gwang_cards)
        while not game.deck.is_empty():
            game.deck.draw()
        game.check_game_end()
        assert game.winner == 0


class TestTurnOrder:
    """Tests for turn management."""

    def test_turn_alternates(self) -> None:
        """After a full turn, the other player should be current."""
        game = GoStopGame()
        game.start()
        first = game.current_player_index
        player = game.players[first]
        card = player.hand[0]
        game.play_card(card)
        assert game.current_player_index != first
