# 맞고 고스톱 v3 - 고급 규칙 + UI 개선

고급 규칙(폭탄, 뻑, 자뻑, 피박, 광박)과 개선된 UI를 적용한 웹 기반 맞고 게임

---

## 📋 개요

v2의 기본 기능에 고급 규칙과 개선된 UI를 추가한 최종 버전. 실제 고스톱의 모든 재미 요소를 구현.

---

## 🆕 v2 → v3 개선사항

### 고급 규칙 추가
- 폭탄 (Bomb)
- 뻑 (Ppuk)
- 자뻑 (Jabppuk)
- 피박 (Pi-bak)
- 광박 (Gwang-bak)
- 흔들기 (Heundeulgi)
- 총통 (Chongtong)
- 쓰리/사리 (Three/Four Go)

### UI 개선
- 더 예쁜 카드 이미지
- 애니메이션 강화
- 다크모드
- 효과음 (선택)

---

## ✨ 기능

### 1. 고급 규칙 구현

#### 폭탄 (Bomb)
```javascript
class Bomb {
  // 손에 같은 월 3장 + 바닥에 1장
  canBomb(hand, floor): boolean
  
  // 폭탄 실행
  executeBomb(month): {
    captured: Card[],      // 4장 획득
    penaltyFromOpponent: number,  // 피 1장
    scoreMultiplier: 2     // 점수 2배
  }
}
```

#### 뻑 (Ppuk)
```javascript
class Ppuk {
  // 같은 월 3장이 바닥에 쌓임
  createPpuk(card1, card2, card3): void
  
  // 뻑 먹기
  capturePpuk(): {
    captured: Card[],
    ppukCreator: Player,  // 뻑 만든 사람
    bonusFrom: Player     // 피 1장 받을 사람
  }
  
  // 첫뻑 보너스
  cheotPpuk: boolean  // 첫 턴 뻑 = 추가 보너스
  
  // 삼연뻑
  samyeonPpuk: boolean  // 3연속 뻑 = 게임 종료
}
```

#### 자뻑 (Jabppuk)
```javascript
class Jabppuk {
  // 자신의 뻑을 자신이 못 먹는 상황
  checkJabppuk(player, ppukStack): boolean
  
  // 자뻑 보너스
  getJabppukBonus(): {
    piFromOpponent: 2  // 피 2장
  }
}
```

#### 피박 (Pi-bak)
```javascript
class PiBak {
  // 패배자 피 6장 이하 + 승리자 피 10장 이상
  checkPiBak(loser, winner): boolean
  
  // 피박 적용
  applyPiBak(): {
    scoreMultiplier: 2
  }
}
```

#### 광박 (Gwang-bak)
```javascript
class GwangBak {
  // 패배자 광 0장 + 승리자 광 3장 이상
  checkGwangBak(loser, winner): boolean
  
  // 광박 적용
  applyGwangBak(): {
    scoreMultiplier: 2
  }
}
```

#### 흔들기 (Heundeulgi)
```javascript
class Heundeulgi {
  // 게임 시작시 같은 월 3장 공개
  declareHeundeulgi(month): void
  
  // 흔들기 효과
  applyHeundeulgi(): {
    scoreMultiplier: 2  // 승리시 2배
  }
}
```

#### 총통 (Chongtong)
```javascript
class Chongtong {
  // 같은 월 4장 모두 보유
  checkChongtong(player): boolean
  
  // 총통 효과
  applyChongtong(): {
    score: 10,
    gameEnd: true
  }
}
```

#### 쓰리/사리 (Three/Four Go)
```javascript
class GoBonus {
  // 고 횟수에 따른 배수
  getGoMultiplier(goCount): number {
    // 1고: x1, 2고: x2, 3고: x4 (자동 승리)
    return Math.pow(2, goCount - 1)
  }
}
```

---

### 2. UI 개선

#### 카드 이미지 개선
```javascript
// 더 선명한 화투 이미지
const CARD_IMAGES_V3 = {
  // 고해상도 이미지 사용
  source: 'https://raw.githubusercontent.com/sunduk/freegostop/master/client/Assets/Resources/Images/Cards/',
  
  // 또는 SVG 카드
  fallback: 'css-drawn-cards'
}
```

#### 애니메이션 강화
```css
/* 폭탄 애니메이션 */
@keyframes bomb {
  0% { transform: scale(1); }
  50% { transform: scale(1.5) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

/* 뻑 애니메이션 */
@keyframes ppuk {
  0% { transform: translateY(0); }
  50% { transform: translateY(-20px) rotate(90deg); }
  100% { transform: translateY(0) rotate(180deg); }
}

/* 흔들기 애니메이션 */
@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}
```

#### 다크모드
```javascript
class ThemeManager {
  toggleTheme(): void
  getCurrentTheme(): 'light' | 'dark'
  
  // CSS 변수로 관리
  setThemeColors(theme): void {
    // --card-bg, --text-color, --bg-color 등
  }
}
```

---

## 🎮 게임 플로우

### 시작 단계
```
1. 카드 분배
2. 흔들기 체크 (같은 월 3장)
3. 총통 체크 (같은 월 4장)
4. 게임 시작
```

### 플레이 단계
```
1. 폭탄 가능 체크
2. 카드 선택
3. 매칭 체크 (뻑 발생 가능)
4. 덱에서 뒤집기
5. 추가 매칭
6. 점수 계산
7. 고/스톱 체크
```

### 종료 단계
```
1. 피박 체크
2. 광박 체크
3. 흔들기 배수 적용
4. 고 배수 적용
5. 최종 점수 계산
6. 승패 결정
```

---

## 📐 요구사항

### 기능 요구사항
- [x] 폭탄 구현 (3장으로 4장 가져오기)
- [x] 뻑 구현 (3장 바닥에 쌓기)
- [x] 자뻑 구현 (자신의 뻑 못 먹기)
- [x] 피박 구현 (피 6장 이하시 2배)
- [x] 광박 구현 (광 0장시 2배)
- [x] 흔들기 구현 (3장 공개시 승리 2배)
- [x] 총통 구현 (4장 = 10점 승리)
- [x] 쓰리/사리 배수 적용
- [x] 복합 배수 계산 (피박+광박+흔들기+고)

### UI 요구사항
- [x] 폭탄 애니메이션
- [x] 뻑 애니메이션
- [x] 흔들기 애니메이션
- [x] 특수 상황 알림
- [x] 다크모드 토글
- [x] 배수 표시 (x2, x4, x8)

---

## 🧪 테스트 시나리오

### 폭탄 테스트
```
Given: 손에 1월 3장, 바닥에 1월 1장
When: 폭탄 실행
Then: 4장 획득 + 피 1장 받음 + 점수 2배
```

### 뻑 테스트
```
Given: 바닥에 3월 2장
When: 3월 카드 내기 + 덱에서 3월 나옴
Then: 3장 바닥에 쌓임 (뻑)
And: 다음 사람이 먹으면 뻑 만든 사람에게 피 1장
```

### 피박 테스트
```
Given: 승리자 피 12장, 패배자 피 5장
When: 게임 종료
Then: 패배자 피박 → 점수 2배
```

### 복합 배수 테스트
```
Given: 흔들기 + 2고 + 피박
When: 게임 종료
Then: 2 (흔들기) x 2 (2고) x 2 (피박) = 8배
```

---

## 💡 참고 자료

### GitHub 프로젝트
- **sunduk/freegostop**: 화투 이미지, 기본 규칙
- **skarl86/gostop_c**: 고급 규칙 (흔들기, 설사, 총통)
- **fudapop/hanafuda-js**: JavaScript 카드 게임 라이브러리

### 규칙 참고
- 나무위키: 고스톱 규칙
- sloperama.com: Go-Stop rules
- pagat.com: Go-Stop detailed rules

---

## 🚀 실행 방법

```bash
# v2와 동일
open index.html

# 또는
python3 -m http.server 8000
```

---

## 📊 예상 결과

```
파일: index.html (50KB+)
기능: 15+ 특수 규칙
UI: 다크모드, 애니메이션
난이도: 실제 고스톱과 동일
```

---

## 🎯 성공 기준

- [ ] 모든 특수 규칙 정상 동작
- [ ] 복합 배수 정확히 계산
- [ ] 애니메이션 부드러움
- [ ] 모바일에서 플레이 가능
- [ ] AI가 특수 규칙 활용
