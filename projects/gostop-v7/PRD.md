# 맞고 고스톱 v7 - 최종 완성판

v4를 기반으로 v5 AI 고도화 + v6 UI/UX 개선을 통합한 최종 완성판

---

## 📋 기반 코드

**반드시 이 파일을 기반으로 작성할 것:**
`/data/data/com.termux/files/home/.openclaw/workspace/projects/gostop-v4/index.html`

이 파일의 모든 기능을 유지하면서 아래 기능을 추가/개선하세요.

---

## ✅ 유지할 v4 기능 (삭제 금지)

- 멀티플레이어 (WebSocket + server.js)
- 효과음 (Web Audio API, Base64)
- 게임 통계 (승/패/점수)
- 튜토리얼 (툴팁)
- 고급 규칙: 폭탄, 뻑, 자뻑, 피박, 광박, 흔들기(3장), 총통, 쓰리사리
- 다크모드
- 카드 테마 선택

---

## 🆕 추가할 v5 기능

### AI 3단계 난이도
- **Easy**: 랜덤 플레이 (초보자용)
- **Medium**: 기본 전략 (광 우선, 총통 고려)
- **Hard**: 고급 전략 (상대 패 분석, 흔들기/고/스톱 최적 타이밍)

### 흔들기 규칙 (정확)
- 같은 월 **3장** 보유시 선언 가능 (2장 아님!)

---

## 🆕 추가/개선할 v6 기능

### UI/UX 대폭 개선

#### CSS 스타일
```css
/* 배경 */
background: linear-gradient(145deg, #0a3d18 0%, #1a6b30 30%, #0d4a1f 60%, #14571e 100%);

/* 카드 */
.card {
  width: 70px;
  height: 105px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,.4);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 16px rgba(255,215,0,.5);
}

.card.selected {
  border: 3px solid #ffd700;
}
```

#### 애니메이션
- 카드 내기: 슬라이드 (cardSlideIn)
- 매칭: 펑 효과 (scale 1.0 → 1.2 → 1.0, 300ms)
- 폭탄: 확대+회전 (scale 1.0 → 1.5, rotate 360deg, 500ms)
- 흔들기: 좌우 흔들림 (shake, 500ms)
- 승리: 폭죽 (confetti, 2s)
- 점수 변화: 숫자 확대 (300ms)

#### 반응형
- 모바일 (320px+): 카드 50x75px
- 태블릿 (768px+): 카드 60x90px
- 데스크톱 (1024px+): 카드 70x105px

#### 턴 표시
- 현재 차례 플레이어 하이라이트
- 턴 번호 표시
- 남은 덱 수 표시

---

## 📐 체크리스트 (완료 시 확인)

- [ ] v4의 모든 기능 유지 (멀티플레이어, 효과음, 통계, 튜토리얼)
- [ ] 고급 규칙 8종 모두 동작 (폭탄, 뻑, 자뻑, 피박, 광박, 흔들기, 총통, 쓰리사리)
- [ ] AI Easy/Medium/Hard 3단계 난이도
- [ ] 흔들기 3장 규칙 정확
- [ ] 그라디언트 배경
- [ ] 카드 호버 애니메이션
- [ ] 매칭/폭탄/흔들기 애니메이션
- [ ] 승리 폭죽 효과
- [ ] 반응형 디자인
- [ ] 화투패 이미지 적용 (assets/cards/${theme}/${mm}_${n}.png)
- [ ] 이미지 로드 실패시 이모지 폴백
- [ ] 다크모드
- [ ] 사운드 선택 (casual/traditional)
- [ ] 카드 테마 선택 (classic/simple/emoji)

---

## ⏱️ 타임아웃: 90분
