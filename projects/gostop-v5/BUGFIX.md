# 맞고 고스톱 v5.1 - 버그 수정

## 발견된 문제점

### 1. 흔들기 규칙 오류 ⚠️
**현재 (v5):** 같은 월 2장만 있어도 흔들기 가능
```javascript
// 줄 322
<li><b>흔들기</b>: 같은 월 2장 보유 시 선택 가능, 점수 2배</li>

// 줄 672
if(monthCount[m]===2)shakes.push(parseInt(m));
```

**올바른 규칙:** 같은 월 3장이어야 흔들기 가능
```javascript
// v4 (올바름)
if(count===3)heundeulgiMonths.push(m);

// v5 (잘못됨)
if(monthCount[m]===2)shakes.push(parseInt(m));
```

### 2. 카드 이미지 미사용 ⚠️
**현재:** assets/cards/ 폴더의 이미지가 있지만 사용하지 않음
```bash
$ grep -c "assets/cards" index.html
0  # 카드 이미지 미사용!
```

**assets/cards/classic/ 폴더:**
- 01_0.png ~ 12_3.png (48장)
- back.png (카드 뒷면)

### 3. v4와의 차이점 비교

| 항목 | v4 | v5 | 상태 |
|------|----|----|------|
| 흔들기 | 3장 | 2장 | ❌ 오류 |
| 카드 이미지 | CDN | 없음 | ❌ 미사용 |
| 사운드 | CDN | assets/ | ✅ 사용 중 |
| AI 난이도 | 없음 | 3단계 | ✅ 개선 |
| 애니메이션 | 빠름 | 느림 | ✅ 개선 |

## 수정 요청사항

### 1. 흔들기 규칙 수정
```javascript
// 수정 전
if(monthCount[m]===2)shakes.push(parseInt(m));

// 수정 후
if(monthCount[m]===3)shakes.push(parseInt(m));
```

UI 텍스트도 수정:
```html
<!-- 수정 전 -->
<li><b>흔들기</b>: 같은 월 2장 보유 시 선택 가능</li>

<!-- 수정 후 -->
<li><b>흔들기</b>: 같은 월 3장 보유 시 선택 가능</li>
```

### 2. 카드 이미지 적용

**이미지 파일 구조:**
```
assets/cards/classic/
├── 01_0.png (1월 광)
├── 01_1.png (1월 열끗)
├── 01_2.png (1월 띠)
├── 01_3.png (1월 피)
├── ...
├── 12_3.png (12월 피)
└── back.png (카드 뒷면)
```

**카드 이미지 사용 코드:**
```javascript
function getCardImage(card) {
  // card: {month: 1-12, type: 0-3}
  // 0: 광, 1: 열끗/동물, 2: 띠, 3: 피
  const cardStyle = settings.cardStyle || 'classic';  // 'classic' or 'simple'
  return `assets/cards/${cardStyle}/${String(card.month).padStart(2, '0')}_${card.type}.png`;
}

function renderCard(card, isBack = false) {
  if (isBack) {
    return `<img src="assets/cards/${settings.cardStyle}/back.png" class="card back">`;
  }
  return `<img src="${getCardImage(card)}" class="card" data-month="${card.month}" data-type="${card.type}">`;
}
```

**CSS 스타일:**
```css
.card {
  width: 60px;
  height: 90px;
  object-fit: cover;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.card.back {
  filter: blur(0);
}
```

### 3. 카드 스타일 선택 UI 추가
```html
<div class="settings-group">
  <label>카드 스타일</label>
  <select id="card-style" onchange="changeCardStyle()">
    <option value="classic">Classic (고해상도)</option>
    <option value="simple">Simple (심플)</option>
  </select>
</div>
```

```javascript
function changeCardStyle() {
  settings.cardStyle = document.getElementById('card-style').value;
  renderAllCards();  // 모든 카드 다시 렌더링
}
```

### 4. 기타 게임 규칙 검증

v4와 비교하여 다음 규칙들이 올바른지 확인:
- 폭탄: 3장 + 바닥 1장 ✅
- 뻑: 3장 바닥에 쌓기 ✅
- 자뻑: 자신의 뻑 못 먹기 ✅
- 피박: 피 6장 이하 패배시 2배 ✅
- 광박: 광 0장 패배시 2배 ✅
- 총통: 4장 보유 = 10점 승리 ✅
- **흔들기: 3장 보유시 선언** ❌ (현재 2장)

## 파일 수정

/data/data/com.termux/files/home/.openclaw/workspace/projects/gostop-v5/index.html

수정 후 저장하고 다시 테스트.

## You have 30 minutes. Fix ALL bugs and add card images.

When finished:
openclaw system event --text "Done: 맞고 고스톱 v5.1 버그 수정 완료" --mode now
