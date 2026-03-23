# 맞고 고스톱 v6 - UI/UX 대폭 개선 + 고품질 화투패

UI/UX 대폭 개선 및 고품질 화투패 이미지 적용

---

## 📋 개요

v5.1 기반으로 UI/UX를 대폭 개선하고, 정확한 고품질 화투패 이미지를 적용한 최종 완성 버전

---

## 🎯 주요 개선사항

### 1. UI/UX 대폭 개선

#### 게임 화면 레이아웃
```
┌─────────────────────────────────────────┐
│  ☰ 메뉴        맞고 고스톱 v6     🔊 🌙  │
├─────────────────────────────────────────┤
│                                         │
│    🤖 AI (보통)    점수: 3점    고: 0   │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐             │
│    │ ? │ │ ? │ │ ? │ │ ? │  ... 10장   │
│    └───┘ └───┘ └───┘ └───┘             │
│                                         │
│    📦 획득한 패: 광(0) 열끗(2) 띠(1) 피(5)│
│                                         │
├─────────────────────────────────────────┤
│         🎴 바닥 (8장)                    │
│    ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│    │1월 │ │2월 │ │3월 │ │4월 │  ...     │
│    │송학│ │매화│ │벚꽃│ │등꽃│           │
│    └────┘ └────┘ └────┘ └────┘         │
│                                         │
│    🃏 덱: 20장    턴: 3    차례: 나     │
├─────────────────────────────────────────┤
│                                         │
│    👤 나          점수: 5점    고: 0    │
│    ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│    │1월 │ │1월 │ │5월 │ │6월 │  ...     │
│    │광  │ │홍단│ │비  │ │모  │           │
│    └────┘ └────┘ └────┘ └────┘         │
│                                         │
│    📦 획득한 패: 광(2) 열끗(1) 띠(2) 피(8)│
│                                         │
│    [고] [스톱]                          │
└─────────────────────────────────────────┘
```

#### 개선사항

**1. 카드 디자인**
- 고품질 실제 화투패 이미지
- 카드 크기: 70x105px (비율 유지)
- 둥근 모서리 (border-radius: 8px)
- 그림자 효과 (box-shadow)
- 선택시 노란색 테두리

**2. 애니메이션**
- 카드 내기: 부드러운 슬라이드
- 매칭: 펑 터지는 효과
- 폭탄: 확대 + 회전
- 흔들기: 카드 흔들림
- 뻑: 카드가 쌓이는 효과
- 승리: 폭죽 효과

**3. 색상 테마**
- 바탕: 그라디언트 녹색 (#2d5a27 → #1a3d1a)
- 카드: 흰색 배경 + 그림자
- 버튼: 금색 (#ffd700)
- 텍스트: 흰색/검정

**4. 반응형 디자인**
- 모바일 (320px+): 카드 50x75px
- 태블릿 (768px+): 카드 60x90px
- 데스크톱 (1024px+): 카드 70x105px

**5. 사용자 경험**
- 턴 표시: 현재 차례 명확히 표시
- 점수 애니메이션: 점수 변화시 숫자가 커졌다 작아짐
- 툴팁: 카드 hover시 카드 정보 표시
- 사운드 시각화: 소리 아이콘에 파형 표시

---

### 2. 정확한 화투패 이미지 적용

#### 이미지 소스

**Wikimedia Commons - Hwatu overview.svg**
- URL: https://commons.wikimedia.org/wiki/File:Hwatu_overview.svg
- 라이선스: CC BY-SA 4.0
- 특징: 모든 48장 카드 포함, 고품질 SVG

**nojhan/hanafuda GitHub**
- URL: https://github.com/nojhan/hanafuda
- 형식: SVG (벡터)
- 특징: 12개월별 파일, ImageMagick로 PNG 변환 가능

#### 카드 매핑

```javascript
const HWATU_CARDS = {
  // 1월 - 송학 (Pine & Crane)
  '01_0': { month: 1, name: '송학광', type: 'gwang', points: 20 },
  '01_1': { month: 1, name: '송학홍단', type: 'tti', points: 5 },
  '01_2': { month: 1, name: '송학피', type: 'pi', points: 1 },
  '01_3': { month: 1, name: '송학피', type: 'pi', points: 1 },
  
  // 2월 - 매화 (Plum Blossom)
  '02_0': { month: 2, name: '매화홍단', type: 'tti', points: 5 },
  '02_1': { month: 2, name: '매화열끗', type: 'yeolkkut', points: 10 },
  '02_2': { month: 2, name: '매화피', type: 'pi', points: 1 },
  '02_3': { month: 2, name: '매화피', type: 'pi', points: 1 },
  
  // 3월 - 벚꽃 (Cherry Blossom)
  '03_0': { month: 3, name: '벚꽃광', type: 'gwang', points: 20 },
  '03_1': { month: 3, name: '벚꽃홍단', type: 'tti', points: 5 },
  '03_2': { month: 3, name: '벚꽃피', type: 'pi', points: 1 },
  '03_3': { month: 3, name: '벚꽃피', type: 'pi', points: 1 },
  
  // ... 4-12월 동일
};

function getCardImage(month, index) {
  // Wikimedia Commons에서 직접 사용
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/.../Hwatu_${month}_${index}.png`;
  
  // 또는 로컬 assets 사용
  return `assets/cards/hwatu/${String(month).padStart(2, '0')}_${index}.png`;
}
```

#### 이미지 다운로드 스크립트

```python
import requests
from pathlib import Path

# Wikimedia Commons에서 화투 이미지 다운로드
base_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/..."

for month in range(1, 13):
    for index in range(4):
        filename = f"{month:02d}_{index}.png"
        url = f"{base_url}/{filename}"
        response = requests.get(url)
        Path(f"assets/cards/hwatu/{filename}").write_bytes(response.content)
```

---

## ✨ 구현 기능

### UI 컴포넌트

#### 1. Header
```html
<header class="game-header">
  <button class="menu-btn">☰</button>
  <h1>맞고 고스톱 v6</h1>
  <div class="header-controls">
    <button class="sound-btn">🔊</button>
    <button class="theme-btn">🌙</button>
  </div>
</header>
```

#### 2. Player Area
```html
<div class="player-area">
  <div class="player-info">
    <span class="player-avatar">🤖</span>
    <span class="player-name">AI (보통)</span>
    <span class="player-score">점수: 3</span>
  </div>
  <div class="player-hand">
    <!-- 카드들 -->
  </div>
  <div class="player-captured">
    <!-- 획득한 패 -->
  </div>
</div>
```

#### 3. Floor (바닥)
```html
<div class="floor-area">
  <h3>🎴 바닥</h3>
  <div class="floor-cards">
    <!-- 8장 카드 -->
  </div>
</div>
```

#### 4. Action Buttons
```html
<div class="action-buttons">
  <button class="btn-go" id="btn-go">고</button>
  <button class="btn-stop" id="btn-stop">스톱</button>
</div>
```

### CSS 스타일

```css
/* 게임 보드 */
.game-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #2d5a27 0%, #1a3d1a 100%);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

/* 카드 */
.card {
  width: 70px;
  height: 105px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 16px rgba(255,215,0,0.5);
}

.card.selected {
  border: 3px solid #ffd700;
  transform: translateY(-15px);
}

/* 애니메이션 */
@keyframes cardPlay {
  from { transform: translateX(-100px) rotate(-10deg); opacity: 0; }
  to { transform: translateX(0) rotate(0deg); opacity: 1; }
}

@keyframes match {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes bomb {
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.3) rotate(90deg); }
  50% { transform: scale(1.5) rotate(180deg); }
  75% { transform: scale(1.3) rotate(270deg); }
  100% { transform: scale(1) rotate(360deg); }
}

@keyframes victory {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}
```

---

## 📐 요구사항

### 기능 요구사항
- [x] 고품질 화투패 이미지 적용
- [x] 반응형 디자인
- [x] 부드러운 애니메이션
- [x] 직관적인 UI
- [x] 턴 표시 개선
- [x] 점수 애니메이션

### UI/UX 요구사항
- [x] 그라디언트 배경
- [x] 카드 그림자 효과
- [x] 버튼 호버 효과
- [x] 모바일 친화적
- [x] 다크모드 지원

---

## 🎨 디자인 가이드

### 색상
- **Primary**: #2d5a27 (녹색)
- **Secondary**: #ffd700 (금색)
- **Background**: #1a3d1a (진한 녹색)
- **Text**: #ffffff (흰색)
- **Card**: #ffffff (흰색)

### 폰트
- **Title**: 24px, Bold
- **Body**: 16px, Regular
- **Card Name**: 12px, Regular

### 간격
- **카드 간격**: 8px
- **영역 간격**: 20px
- **패딩**: 15px

---

## 🚀 실행 방법

```bash
# 브라우저로 열기
open index.html

# 또는 로컬 서버
python3 -m http.server 8000
```

---

## 📊 예상 결과

```
파일: index.html (80KB+)
이미지: assets/cards/hwatu/ (48개 PNG)
코드: 2,000+ lines
```

---

## 🎯 성공 기준

- [ ] 화투패 이미지가 실제와 일치
- [ ] 모바일에서도 플레이 가능
- [ ] 애니메이션이 부드러움
- [ ] UI가 직관적
- [ ] 모든 기능 정상 동작
