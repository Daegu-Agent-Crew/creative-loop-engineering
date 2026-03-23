# OpenClaw Visualizer Phase 2 - 애니메이션 + 효과음

Phase 1의 index.html을 기반으로 애니메이션과 효과음을 추가합니다.
**기존 기능은 모두 유지하면서 시각적 효과만 추가하세요.**

---

## 📋 기반 파일

`$(pwd)/index.html` - Phase 1에서 만든 파일. 이 파일을 읽고 수정하세요.

---

## 🎬 추가할 애니메이션

### 1. 노드 활성화 효과
```css
.node.active {
  border-color: var(--neon); /* #00ffff */
  box-shadow: 0 0 30px rgba(0,255,255,.6);
  transform: scale(1.08);
  transition: all 0.4s cubic-bezier(.34,1.56,.64,1);
}
```

### 2. 캐릭터(💡) 이동
- 메시지가 단계를 진행할 때, 현재 활성 노드 근처에 💡아이콘이 나타남
- 노드 사이를 이동하는 간단한 transition (top/left 변경)
- 캐릭터 주변에 glow 효과

```css
.character {
  position: absolute;
  width: 24px; height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff, #00ffff, transparent);
  box-shadow: 0 0 20px #00ffff;
  transition: all 0.8s ease-in-out;
}
```

### 3. 마법진 (Pi Runtime)
- Agent Core 층의 Pi Runtime 노드 안에 회전하는 마법진 SVG
- 활성화 시 회전 속도 증가
- border: 2px dashed가 회전하는 효과

```css
.magic-circle {
  border: 2px dashed rgba(156,39,176,.5);
  border-radius: 50%;
  animation: spin 4s linear infinite;
}
.magic-circle.active {
  border-color: #9C27B0;
  animation-duration: 1s;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

### 4. XP 획득 효과
- 퀘스트 완료 시 "+50 XP" 텍스트가 위로 올라가며 페이드아웃
```css
@keyframes float-up {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-40px); }
}
```

### 5. 레벨업 효과
- 상태창 XP 바가 100% 도달 시 화면 중앙에 "⭐ LEVEL UP!" 텍스트 표시
- 3초 후 사라짐
- 간단한 scale 애니메이션

### 6. Heartbeat (Cron 노드)
- Cron 노드가 주기적으로 scale(1.0 → 1.15 → 1.0) 반복
- 심장 박동처럼
```css
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
```

### 7. 에러 효과
- 에러 발생 시 해당 노드가 빨간색으로 깜빡임
```css
@keyframes error-flash {
  0%, 100% { border-color: #ff0000; }
  50% { border-color: transparent; }
}
```

### 8. 층 전환 하이라이트
- 메시지가 새 층으로 진입할 때, 해당 층의 배경이 살짝 밝아짐
- 1초 후 원래대로 복귀

### 9. 퀘스트 로그 스크롤 애니메이션
- 새 로그 항목이 추가될 때 부드럽게 스크롤
- 새 항목이 fadeIn

### 10. 데이터 패킷 (연결선 위)
- 노드 간 연결선 위를 작은 점이 이동하는 효과 (SVG circle + animateMotion)
- 활성화된 연결선에서만 표시

---

## 🔊 추가할 효과음 (Web Audio API)

간단한 사인파/스퀘어파로 효과음 생성 (외부 파일 없이):

| 효과음 | 트리거 | 소리 |
|--------|--------|------|
| **move** | 캐릭터 이동 | 짧은 높은음 (200ms) |
| **activate** | 노드 활성화 | 두음 "띠링" (300ms) |
| **tool** | 툴 실행 | 뭉탁한 "둥" (400ms) |
| **complete** | 퀘스트 완료 | 상승 음계 (500ms) |
| **levelup** | 레벨업 | 팬파레 음계 (800ms) |
| **heartbeat** | 하트비트 | 낮은 "쿵" (200ms) |
| **error** | 에러 | 낮은 불협화음 (300ms) |

```javascript
function playSound(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  switch(type) {
    case 'move':
      osc.frequency.value = 800; gain.gain.value = 0.1;
      osc.start(); osc.stop(ctx.currentTime + 0.1);
      break;
    case 'activate':
      osc.frequency.value = 1200; gain.gain.value = 0.1;
      osc.start(); osc.stop(ctx.currentTime + 0.15);
      break;
    // ... etc
  }
}
```

---

## 🎨 추가할 시각 효과

### 배경 파티클
- 배경에 느리게 떠다니는 작은 점 20개 (CSS animation)
- 투명도 낮게, 움직임 느리게

### 노드 내부 아이콘
- 각 노드 안에 이모지 아이콘 (이미 있으면 유지)
- 활성화 시 아이콘이 살짝 크기 변화

### 미니맵 현재 위치
- 미니맵에서 현재 활성 층을 밝은 색으로 표시
- 간단한 background-color transition

---

## ✅ Phase 2 체크리스트

- [ ] Phase 1의 모든 기능 유지 (레이아웃, 시나리오, 로그 등)
- [ ] 노드 활성화 glow + scale 효과
- [ ] 캐릭터(💡) 노드 간 이동
- [ ] 마법진 회전 (Pi Runtime)
- [ ] XP 획득 float-up 애니메이션
- [ ] 레벨업 효과
- [ ] Heartbeat 애니메이션 (Cron)
- [ ] 에러 flash 애니메이션
- [ ] 층 전환 하이라이트
- [ ] 퀘스트 로그 fadeIn + auto-scroll
- [ ] 데이터 패킷 이동 (SVG)
- [ ] 배경 파티클
- [ ] Web Audio 효과음 7종
- [ ] 소리 끄기/켜기 버튼
- [ ] 미니맵 현재 층 하이라이트

---

## ⏱️ 타임아웃: 45분
