# 맞고 (고스톱) 게임

한국 전통 카드 게임 맞고(고스톱) 구현

---

## 📋 개요

화투 48장을 사용한 2인용 맞고 게임. 턴제 카드 게임으로, 같은 월의 카드를 매칭하여 점수를 얻고, 먼저 목표 점수에 도달하거나 상대방보다 높은 점수를 얻으면 승리.

---

## ✨ 기능

### 핵심 기능

#### 1. 카드 시스템
```python
class HwatuCard:
    month: int          # 1-12월
    card_type: str      # "gwang", "yeol", "tti", "pi"
    name: str           # 카드 이름
    points: int         # 점수
```

#### 2. 게임 초기화
```python
def create_deck() -> list[HwatuCard]
    """48장 화투 덱 생성"""
    
def shuffle_deck(deck: list) -> list
    """덱 섞기"""
    
def deal_cards(deck: list, num_players: int) -> tuple[list, list, list]
    """카드 분배: (플레이어 손패들, 바닥 카드, 남은 덱)"""
```

#### 3. 게임 진행
```python
def play_card(player_hand: list, card_index: int, floor: list) -> dict
    """카드 내기. 매칭시 가져가기. 반환: {success, matched, captured}"""
    
def draw_card(deck: list, player_hand: list, floor: list) -> dict
    """덱에서 카드 뽑기. 매칭시 가져가기."""
    
def get_matching_cards(card: HwatuCard, floor: list) -> list
    """바닥에서 같은 월의 카드 찾기"""
```

#### 4. 점수 계산
```python
def calculate_score(captured: list[HwatuCard]) -> dict
    """점수 계산. 반환: {total, gwang, yeol, tti, pi, bonus}"""
    
def check_go(captured: list, current_score: int) -> bool
    """고 할 수 있는지 확인 (3점 이상)"""
    
def calculate_final_score(winner_captured: list, loser_captured: list, go_count: int) -> int
    """최종 점수 계산 (고박 등 포함)"""
```

#### 5. 특수 조합
```python
def check_cheongdan(captured: list) -> bool
    """청단 확인 (초롱, 춤, 홍단 3장)"""
    
def check_hongdan(captured: list) -> bool
    """홍단 확인 (홍단 3장)"""
    
def check_chodan(captured: list) -> bool
    """초단 확인 (초단 3장)"""
    
def check_gwangtong(captured: list) -> bool
    """광통 확인 (비광 제외 광 3장)"""
```

---

## 🎮 게임 규칙

### 기본 규칙
1. 48장 화투 중 각 플레이어 10장, 바닥 8장, 나머지는 덱
2. 자기 차례에 손패에서 1장 내기 → 같은 월 매칭시 가져가기
3. 덱에서 1장 뽑기 → 같은 월 매칭시 가져가기
4. 점수 3점 이상시 "고" 또는 "스톱" 선택
5. 3번 "고"시 자동 승리

### 카드 점수
- **광**: 1점 (3장부터), 비광(3월 광)은 특수
- **열끗**: 1점 (5장부터), 10장 이상 2배
- **띠**: 1점 (5장부터), 10장 이상 2배
- **피**: 1점 (10장부터)

### 특수 조합
- **광통**: 광 3장 (비광 제외) = +3점
- **청단**: 초롱, 춤, 홍단 = +3점
- **홍단**: 홍단 3장 = +3점
- **초단**: 초단 3장 = +3점
- **멍텅구리**: 광 4장 = +4점
- **오광**: 광 5장 = +5점

### 승리 조건
- "스톱" 선택시 즉시 승리
- 3번 "고"시 자동 승리
- 덱이 소진되면 점수 비교

---

## 🔒 제약사항

- 2인용만 구현 (3인용 제외)
- GUI 없이 콘솔 기반
- 난이도 조절 없이 기본 규칙만
- 저장/불러오기 미구현
- AI 플레이어 없이 사람 vs 사람

---

## 📐 요구사항

### 기능 요구사항
- [ ] 48장 화투 덱 생성
- [ ] 카드 분배 (플레이어 10장, 바닥 8장)
- [ ] 카드 내기 & 매칭 로직
- [ ] 덱에서 카드 뽑기
- [ ] 점수 계산 (광, 열끗, 띠, 피)
- [ ] 특수 조합 점수 (청단, 홍단, 광통)
- [ ] 고/스톱 선택
- [ ] 승리 판정
- [ ] 게임 상태 표시

### 비기능 요구사항
- [ ] 모든 함수에 타입 힌트
- [ ] 모든 public 함수에 docstring
- [ ] 에러 처리 (잘못된 카드 선택 등)
- [ ] 게임 상태 불변성 유지

---

## 🎯 인수 조건

- [ ] 게임 시작시 카드가 올바르게 분배됨
- [ ] 같은 월 카드 매칭시 정상 가져가기
- [ ] 점수 계산이 정확함
- [ ] 특수 조합 점수가 올바르게 적용됨
- [ ] 고/스톱 선택이 정상 동작함
- [ ] 승리 조건이 정확히 판정됨
- [ ] 3고 이후 자동 승리
- [ ] 덱 소진시 게임 종료

---

## 💻 예시 사용법

```python
# 게임 생성
game = GoStopGame()

# 게임 시작
game.start()
# 플레이어1: [카드10장]
# 플레이어2: [카드10장]
# 바닥: [카드8장]

# 카드 내기
result = game.play_card(player=0, card_index=3)
# {success: True, matched: True, captured: [Card(...), Card(...)]}

# 덱에서 뽑기
result = game.draw_from_deck(player=0)
# {matched: False, drawn_card: Card(...)}

# 점수 확인
scores = game.get_scores()
# {player1: 5, player2: 3}

# 고/스톱 선택
game.call_go(player=0)  # or game.call_stop(player=0)

# 게임 종료
winner = game.get_winner()
# {winner: 0, score: 15, reason: "stop"}
```

---

## 📁 프로젝트 구조

```
gostop/
├── PRD.md
├── src/
│   ├── __init__.py
│   ├── card.py          # HwatuCard 클래스
│   ├── deck.py          # 덱 관리
│   ├── game.py          # 게임 로직
│   ├── scorer.py        # 점수 계산
│   └── display.py       # 콘솔 출력
└── tests/
    ├── __init__.py
    ├── test_card.py
    ├── test_deck.py
    ├── test_game.py
    └── test_scorer.py
```

---

## 🧪 테스트 시나리오

### Happy Path
1. 덱 생성 → 48장 확인
2. 카드 분배 → 각 10장 + 바닥 8장
3. 같은 월 카드 매칭 → 2장 가져가기
4. 점수 3점 달성 → 고 선택
5. 3고 달성 → 자동 승리

### Edge Cases
1. 같은 월 카드가 바닥에 3장 → 1장 내고 3장 다 가져가기
2. 매칭되는 카드 없음 → 카드 바닥에 놓기
3. 바닥에 피 2장 → 10점 달성
4. 광 3장 (비광 포함) → 2점
5. 덱 소진 → 게임 종료

### Error Cases
1. 없는 카드 인덱스 선택 → 에러
2. 잘못된 차례 → 에러
3. 3점 미만시 고 선택 → 에러

---

## 📝 참고

- 맞고 규칙은 지역마다 다를 수 있음
- 본 PRD는 가장 일반적인 2인 맞고 규칙 기준
- 복잡한 규칙(쓰리고, 박 등)은 추후 추가 가능
