"""Hwatu card definitions for Go-Stop (맞고)."""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class CardType(Enum):
    """Types of hwatu cards."""
    GWANG = "광"        # Bright
    YEOLKKEUT = "열끗"  # Animal
    TTI = "띠"          # Ribbon
    PI = "피"           # Junk


@dataclass(frozen=True)
class HwatuCard:
    """A single hwatu card.

    Args:
        month: The month (1-12) this card belongs to.
        card_type: The type of card (gwang, yeolkkeut, tti, pi).
        name: The Korean name of the card.
    """
    month: int
    card_type: CardType
    name: str

    def __post_init__(self) -> None:
        """Validate month is between 1 and 12."""
        if not 1 <= self.month <= 12:
            raise ValueError(f"Month must be 1-12, got {self.month}")

    def __str__(self) -> str:
        """Return human-readable card representation."""
        return f"{self.month}월 {self.name} ({self.card_type.value})"


def _build_hwatu_cards() -> list[HwatuCard]:
    """Build the complete set of 48 hwatu cards.

    Returns:
        List of all 48 hwatu cards, 4 per month.
    """
    cards: list[HwatuCard] = []

    # Month 1 - 송학 (Pine/Crane)
    cards.append(HwatuCard(1, CardType.GWANG, "송학"))
    cards.append(HwatuCard(1, CardType.TTI, "홍단"))
    cards.append(HwatuCard(1, CardType.PI, "송피1"))
    cards.append(HwatuCard(1, CardType.PI, "송피2"))

    # Month 2 - 매화 (Plum Blossom)
    cards.append(HwatuCard(2, CardType.YEOLKKEUT, "매조"))
    cards.append(HwatuCard(2, CardType.TTI, "홍단"))
    cards.append(HwatuCard(2, CardType.PI, "매피1"))
    cards.append(HwatuCard(2, CardType.PI, "매피2"))

    # Month 3 - 벚꽃 (Cherry Blossom)
    cards.append(HwatuCard(3, CardType.GWANG, "벚꽃광"))
    cards.append(HwatuCard(3, CardType.TTI, "홍단"))
    cards.append(HwatuCard(3, CardType.PI, "벚피1"))
    cards.append(HwatuCard(3, CardType.PI, "벚피2"))

    # Month 4 - 흑싸리 (Wisteria)
    cards.append(HwatuCard(4, CardType.YEOLKKEUT, "흑싸리조"))
    cards.append(HwatuCard(4, CardType.TTI, "초단"))
    cards.append(HwatuCard(4, CardType.PI, "흑피1"))
    cards.append(HwatuCard(4, CardType.PI, "흑피2"))

    # Month 5 - 난초 (Orchid)
    cards.append(HwatuCard(5, CardType.YEOLKKEUT, "난초조"))
    cards.append(HwatuCard(5, CardType.TTI, "초단"))
    cards.append(HwatuCard(5, CardType.PI, "난피1"))
    cards.append(HwatuCard(5, CardType.PI, "난피2"))

    # Month 6 - 모란 (Peony)
    cards.append(HwatuCard(6, CardType.YEOLKKEUT, "모란조"))
    cards.append(HwatuCard(6, CardType.TTI, "청단"))
    cards.append(HwatuCard(6, CardType.PI, "모피1"))
    cards.append(HwatuCard(6, CardType.PI, "모피2"))

    # Month 7 - 홍싸리 (Bush Clover)
    cards.append(HwatuCard(7, CardType.YEOLKKEUT, "홍싸리조"))
    cards.append(HwatuCard(7, CardType.TTI, "초단"))
    cards.append(HwatuCard(7, CardType.PI, "홍피1"))
    cards.append(HwatuCard(7, CardType.PI, "홍피2"))

    # Month 8 - 공산 (Moon/ススки)
    cards.append(HwatuCard(8, CardType.GWANG, "공산광"))
    cards.append(HwatuCard(8, CardType.YEOLKKEUT, "공산조"))
    cards.append(HwatuCard(8, CardType.PI, "공피1"))
    cards.append(HwatuCard(8, CardType.PI, "공피2"))

    # Month 9 - 국화 (Chrysanthemum)
    cards.append(HwatuCard(9, CardType.YEOLKKEUT, "국화조"))
    cards.append(HwatuCard(9, CardType.TTI, "청단"))
    cards.append(HwatuCard(9, CardType.PI, "국피1"))
    cards.append(HwatuCard(9, CardType.PI, "국피2"))

    # Month 10 - 단풍 (Maple)
    cards.append(HwatuCard(10, CardType.YEOLKKEUT, "단풍조"))
    cards.append(HwatuCard(10, CardType.TTI, "청단"))
    cards.append(HwatuCard(10, CardType.PI, "단피1"))
    cards.append(HwatuCard(10, CardType.PI, "단피2"))

    # Month 11 - 오동 (Paulownia)
    cards.append(HwatuCard(11, CardType.GWANG, "오동광"))
    cards.append(HwatuCard(11, CardType.TTI, "초단"))
    cards.append(HwatuCard(11, CardType.PI, "오피1"))
    cards.append(HwatuCard(11, CardType.PI, "오피2"))

    # Month 12 - 비 (Rain)
    cards.append(HwatuCard(12, CardType.GWANG, "비광"))
    cards.append(HwatuCard(12, CardType.YEOLKKEUT, "비조"))
    cards.append(HwatuCard(12, CardType.PI, "비피1"))
    cards.append(HwatuCard(12, CardType.PI, "비피2"))

    return cards


HWATU_CARDS: list[HwatuCard] = _build_hwatu_cards()
