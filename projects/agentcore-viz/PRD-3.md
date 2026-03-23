# Agent Core Viz 3: 🚀 우주 미션 컨트롤

OpenClaw Agent Core를 NASA 미션 컨트롤 센터로 시각화합니다.

기반 정보: CONTEXT.md 읽을 것.
반드시 $(pwd)/mission.html 파일에 저장할 것 (터미널 출력 금지).
외부 라이브러리 사용 금지 (순수 HTML/CSS/JS).

## 컨셉

메시지 처리를 우주 임무처럼: 발사 → 궤도 진입 → 임무 수행 → 귀환.

## 구현

### 미션 컨트롤 센터 UI
중앙에 우주선 다이어그램 (SVG/CSS), 주변에 모니터링 패널.

### 미션 단계 (오른쪽 타임라인)
```
🟢 T-00:00 수신 (Channel Adapter)
🟡 T+00:01 큐 대기 (Queue)
🟡 T+00:02 컨텍스트 조립 (Session Manager)
🔵 T+00:03 추론 (Agent Runtime)
🟠 T+00:04 툴호출 (Tool Execution)
🔵 T+00:05 재추론 (Agent Runtime)
🟢 T+00:06 응답 전송 (Channel Adapter)
✅ T+00:07 임무 완료
```

### 중앙 우주선 시각화
- 우주선 CSS 그림 (간단한 SVG 또는 CSS 모양)
- 각 부분이 현재 미션 단계에 따라 빛남
  - 코: Channel Adapter
  - 동체: Queue + Session Manager
  - 엔진: Agent Runtime
  - 날개: Tool Policy

### 컨트롤 패널 (왼쪽)
- 미션 선택 (3개 시나리오)
- 발사 버튼
- 중단 버튼
- 속도 제어

### 원격 측정 (Telemetry)
실시간 업데이트되는 수치:
- 📡 Signal Strength: context 사용률
- ⛽ Fuel: 남은 토큰
- 🔥 Engine Temp: 모델 추론 온도
- 📍 Position: 현재 루프 단계
- 🛰️ Payload: 툴호출 횟수
- ⏱️ Mission Time: 경과 시간

### 애니메이션
- 우주선 배경에 별 이동 (CSS)
- 미션 진행 시 카운트다운
- 툴호출 시 엔진 불꽃
- 완료 시 성공 파티클

### 반응형 + 한국어 UI

## ⏱️ 타임아웃: 30분
