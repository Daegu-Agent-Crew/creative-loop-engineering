# 맞고 고스톱 v2 - 웹 버전

HTML/JavaScript로 구현된 웹 브라우저 기반 맞고 고스톱 게임

---

## 📋 개요

싱글 HTML 파일로 구성된 맞고 고스톱 게임. 웹 브라우저에서 바로 실행 가능하며, 실제 화투 카드 이미지를 사용하여 시각적으로 완성도 높은 게임 제공.

---

## ✨ 기능

### 핵심 기능

#### 1. 게임 화면
```javascript
- 게임판 (바닥 카드 8장 표시)
- 플레이어 손패 (10장)
- AI 손패 (10장, 뒷면)
- 획득한 카드 영역
- 점수 표시
- 현재 턴 표시
```

#### 2. 게임 진행
```javascript
class GoStopGame {
  startGame()
  playCard(playerIndex, cardIndex)
  drawFromDeck(playerIndex)
  getMatchingCards(card, floor)
  switchTurn()
  checkWinCondition()
}
```

#### 3. AI 플레이어
```javascript
class AIPlayer {
  selectCard(hand, floor)  // 최적 카드 선택
  evaluateBestMatch(card, floor)
}
```

#### 4. 점수 계산
```javascript
class ScoreCalculator {
  calculateScore(captured)
  checkGwang()
  checkYeolkkut()
  checkTti()
  checkPi()
  checkSpecialCombos()  // 청단, 홍단, 초단
}
```

---

## 🎨 UI/UX

### 레이아웃
```
┌─────────────────────────────────────┐
│  [AI 점수: 3점]     [AI 획득 카드]   │
│  [AI 손패: ■■■■■■■■■■]              │
├─────────────────────────────────────┤
│                                     │
│     [바닥 카드 8장]                  │
│                                     │
├─────────────────────────────────────┤
│  [플레이어 손판 10장]                │
│  [플레이어 점수: 5점] [획득 카드]    │
│                                     │
│  [고] [스톱]                        │
└─────────────────────────────────────┘
```

### 카드 표시
- 월별로 색상/이미지 구분
- 광, 열끗, 띠, 피 아이콘
- 선택 가능한 카드 하이라이트
- 애니메이션 (카드 내기, 획득)

---

## 🖼️ 이미지 리소스

### 화투 카드 이미지
- **출처**: https://github.com/sunduk/freegostop
- **라이선스**: 상업적/비상업적 자유 사용 가능
- **이미지 URL**: 
  ```
  https://raw.githubusercontent.com/sunduk/freegostop/master/client/Assets/Resources/Images/Cards/
  ```

### 카드 매핑
```javascript
const CARD_IMAGES = {
  // 1월 (송학)
  '1_gwang': 'january_gwang.png',
  '1_yeol': 'january_yeol.png',
  '1_tti': 'january_tti.png',
  '1_pi': 'january_pi.png',
  // ... 12월까지
}
```

---

## 🎮 게임 규칙

### 기본 규칙
1. 48장 화투 사용
2. 플레이어 vs AI
3. 각 10장 + 바닥 8장 + 덱 20장
4. 같은 월 매칭시 획득
5. 3점 이상시 고/스톱 선택
6. 3고시 자동 승리

### 점수 계산
- **광**: 3장 1점, 4장 2점, 5장 15점
- **열끗**: 5장 1점, 10장+ 2배
- **띠**: 5장 1점, 10장+ 2배
- **피**: 10장 1점

### 특수 조합
- **청단**: 초단 3장 (+3점)
- **홍단**: 홍단 3장 (+3점)
- **광통**: 광 3장 (+3점, 비광 제외)

---

## 🔒 제약사항

- **단일 HTML 파일**: 모든 코드와 스타일 포함
- **외부 의존성 없음**: 순수 HTML/CSS/JS
- **이미지**: CDN 또는 Base64 인코딩
- **저장 없음**: 게임 상태 저장 기능 없음
- **2인용만**: AI vs 플레이어

---

## 📐 요구사항

### 기능 요구사항
- [x] 48장 화투 덱 생성
- [x] 카드 분배 (각 10장, 바닥 8장)
- [x] 카드 클릭으로 내기
- [x] 같은 월 매칭 로직
- [x] 덱에서 카드 뽑기
- [x] AI 플레이어 로직
- [x] 점수 실시간 계산
- [x] 고/스톱 버튼
- [x] 승리 팝업
- [x] 재시작 버튼

### UI 요구사항
- [x] 반응형 디자인 (모바일 지원)
- [x] 카드 애니메이션
- [x] 턴 표시
- [x] 점수 표시
- [x] 게임 상태 표시

---

## 🎯 인수 조건

- [ ] 브라우저에서 파일 열면 바로 게임 시작
- [ ] 카드 클릭으로 정상 플레이
- [ ] AI가 자동으로 플레이
- [ ] 점수가 정확히 계산됨
- [ ] 3점 이상시 고/스톱 버튼 활성화
- [ ] 승리시 결과 팝업
- [ ] 모바일에서도 플레이 가능

---

## 💻 기술 스택

- **HTML5**: 구조
- **CSS3**: 스타일, 애니메이션
- **JavaScript (ES6+)**: 게임 로직
- **이미지**: GitHub CDN 또는 Base64

---

## 📁 파일 구조

```
gostop-v2/
├── index.html          # 메인 게임 파일 (모든 것 포함)
└── README.md           # 설명서
```

---

## 🧪 테스트 시나리오

### Happy Path
1. 게임 시작 → 카드 분배 확인
2. 카드 클릭 → 매칭 확인
3. AI 턴 → 자동 플레이
4. 3점 달성 → 고/스톱 선택
5. 게임 종료 → 결과 표시

### Edge Cases
1. 같은 월 3장 매칭
2. 매칭 없음 → 바닥에 놓기
3. 덱 소진 → 게임 종료

---

## 📝 추가 개선사항

### v2.1 (선택)
- [ ] 게임 상태 저장 (localStorage)
- [ ] 난이도 조절
- [ ] 효과음
- [ ] 더 똑똑한 AI

---

## 🔗 참고 자료

- **카드 이미지**: https://github.com/sunduk/freegostop
- **게임 규칙**: 한국 전통 맞고 규칙
- **CSS 카드 애니메이션**: flip, fade, slide

---

## 💡 개발자 노트

### 카드 이미지 처리 옵션

**옵션 1: CDN 사용**
```html
<img src="https://raw.githubusercontent.com/.../card.png">
```

**옵션 2: Sprite Sheet**
- 모든 카드를 하나의 이미지로
- CSS background-position으로 표시

**옵션 3: SVG/CSS 그리기**
- 이미지 없이 CSS로 카드 디자인
- 가볍지만 덜 예쁨

**권장**: 옵션 1 (CDN) + 오프라인 대비 CSS 폴백

---

## 🚀 실행 방법

```bash
# 다운로드 후
open index.html

# 또는
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000
```
