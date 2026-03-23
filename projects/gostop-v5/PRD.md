# RALPHTON HARNESS - 맞고 고스톱 v5 (AI 고도화)

## 목표
v4 기반으로 AI를 고도화하고 더 재미있는 게임을 만드세요.

## v4 기반 유지사v4의 모든 기능을 유지하면서 다음을 추가:

### 1. AI 시스템 (3단계 난이도)
```javascript
class AIPlayer {
  constructor(difficulty = 'easy') {
    this.difficulty = difficulty  // 'easy', 'medium', 'hard'
  }
  
  selectCard(hand, floor, gameState) {
    switch(this.difficulty) {
      case 'easy':
        return this.easyStrategy(hand, floor)
      case 'medium':
        return this.mediumStrategy(hand, floor, gameState)
      case 'hard':
        return this.hardStrategy(hand, floor, gameState)
    }
  }
  
  // 초급: 완전 랜덤
  easyStrategy(hand, floor) {
    const randomIndex = Math.floor(Math.random() * hand.length)
    return hand[randomIndex]
  }
  
  // 중급: 기본 전략
  mediumStrategy(hand, floor, gameState) {
    // 1. 매칭 가능한 카드 우선
    for (let card of hand) {
      const matches = floor.filter(f => f.month === card.month)
      if (matches.length > 0) {
        return card  // 매칭 우선
      }
    }
    
    // 2. 고점수 카드 우선 (광, 열끗)
    const highValueCards = hand.filter(c => 
      c.type === 'gwang' || c.type === 'yeolkkut'
    )
    if (highValueCards.length > 0) {
      return highValueCards[0]
    }
    
    // 3. 랜덤
    return hand[Math.floor(Math.random() * hand.length)]
  }
  
  // 고급: 전략적 선택
  hardStrategy(hand, floor, gameState) {
    // 1. 폭탄 기회 확인
    if (this.canBomb(hand, floor)) {
      return this.selectBombCards(hand, floor)
    }
    
    // 2. 흔들기 기회 확인
    if (this.canShake(hand)) {
      this.declareShake()
      // 흔들기 후 최고 점수 카드 선택
    }
    
    // 3. 점수 계산 및 최적화
    const bestCard = this.findBestScoringCard(hand, floor, gameState)
    
    // 4. 상대방 패 분석
    const opponentDanger = this.analyzeOpponent(gameState)
    if (opponentDanger) {
      return this.defensivePlay(hand, floor)
    }
    
    return bestCard
  }
  
  // AI 설명 패널 (난이도: hard만)
  explainChoice(card, reason) {
    return {
      card: card,
      reason: reason,
      expectedScore: this.calculateExpectedScore(card),
      risk: this.assessRisk(card)
    }
  }
}
```

### 2. 애니메이션 속도 조절

v4 애니메이션 속도를 **1.5배 느리게** 조정

```css
/* v4 */
.card-play { transition: 0.3s; }
.card-match { transition: 0.2s; }

/* v5 - 1.5배 느리게 */
.card-play { transition: 0.45s; }  /* 0.3s × 1.5 */
.card-match { transition: 0.3s; }  /* 0.2s × 1.5 */
.bomb-animation { animation: bomb 1.5s; }  /* 1.0s × 1.5 */
.shake-animation { animation: shake 0.75s; }  /* 0.5s × 1.5 */
```

### 3. 커스텀 이미지 사용

assets/cards/classic/ 또는 assets/cards/simple/ 폴더의 이미지 사용

```javascript
const CARD_BASE_PATH = 'assets/cards/classic/'

function getCardImagePath(card) {
  return `${CARD_BASE_PATH}${card.month}_${card.type}.png`
}
```

### 4. 선택적 사운드 적용

assets/sounds/casual/ 또는 assets/sounds/traditional/ 폴더의 사운드 선택적 사용

```javascript
class SoundManager {
  constructor(soundStyle = 'casual') {
    this.soundStyle = soundStyle  // 'casual' 또는 'traditional'
    this.enabled = true
  }
  
  getSoundPath(soundName) {
    return `assets/sounds/${this.soundStyle}/${soundName}.mp3`
  }
  
  play(soundName) {
    if (!this.enabled) return
    const audio = new Audio(this.getSoundPath(soundName))
    audio.play()
  }
  
  setSoundStyle(style) {
    this.soundStyle = style
  }
}
```

## 파일 구조

```
gostop-v5/
├── index.html (70KB+)      ← 메인 게임 파일
├── server.js (5KB)         ← WebSocket 서버 (v4와 동일)
├── assets/
│   ├── cards/
│   │   ├── classic/        ← 고전 카드 (48장)
│   │   └── simple/          ← 심플 카드 (48장)
│   └── sounds/
│       ├── casual/          ← 캐주얼 사운드 (8개)
│       └── traditional/     ← 트래디셔널 사운드 (8개)
└── PRD.md
```

## 구현 순서

1. v4 코드 복사 (index.html + server.js)
2. assets 폴더 설정 (이미 압축 해제됨)
3. AI 시스템 재작성 (3단계 난이도)
4. 애니메이션 속도 조절 (1.5배 느리게)
5. 이미지 경로 수정 (assets/cards/)
6. 사운드 시스템 수정 (선택적 적용)
7. UI에 난이도 선택 추가

## 제약사항
- v4 모든 기능 유지
- 파일 크기: 80KB+ 예상
- 라인: 3,000+ 예상

## You have 60 minutes. Enhance AI system and adjust animation speed.

When finished, run:
openclaw system event --text "Done: 맞고 고스톱 v5 AI 고도화 완료" --mode now
