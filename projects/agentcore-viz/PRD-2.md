# Agent Core Viz 2: 🏭 공장 컨베이어 벨트

OpenClaw Agent Core를 자동화 공장의 컨베이어 벨트로 시각화합니다.

기반 정보: CONTEXT.md 읽을 것.
반드시 $(pwd)/factory.html 파일에 저장할 것 (터미널 출력 금지).
외부 라이브러리 사용 금지 (순수 HTML/CSS/JS).

## 컨셉

메시지가 공장의 원자재로 들어와, 각 공정(Station)을 거치며 가공되어 최종 제품(응답)이 되는 과정.

## 구현

### 공장 레이아웃 (가로 스크롤)
```
[입구] → [Station1: Channel] → [Station2: Queue] → [Station3: Session] → [Station4: Agent Runtime] → [Station5: Tool Policy] → [출구]
```

각 Station은 공장 설비처럼 생김 (기계 모양 CSS).

### 컨베이어 벨트 애니메이션
- 메시지가 아이콘(📦)으로 컨베이어 벨트 위를 이동
- 각 Station에서 일시 정지하며 가공 (기계 움직임)
- 가공 완료 후 다음 Station으로 이동

### 시뮬레이션 시나리오 3개
1. 단순 질문: 4개 Station 통과 (5초)
2. 툴호출: Agent Runtime에서 되돌아가며 (7초)
3. 압축 발생: Session Station에서 압축 애니메이션 추가 (10초)

### Station 상세 (클릭)
- 각 Station의 역할, Hook 포인트, 데이터 흐름
- Bootstrap Files 표시 (Session Station)
- Compaction 시각화 (압축 머신)

### 모니터링 대시보드
상단에 공장 관리 대시보드:
- 처리량 (메시지/분)
- 각 Station 대기시간
- Tool Policy 통과/거부 통계
- Context Window 사용률 게이지

### 비주얼
- 배경: 어두운 공장(#1a1a2e)
- 벨트: 회색 체크무늬 CSS 패턴, 이동 애니메이션
- 기계: 직사각형 + 기어 CSS 회전
- 아이콘: 📦 메시지, ⚙️ 가공, ✅ 완료, ❌ 거부

### 반응형 + 한국어 UI

## ⏱️ 타임아웃: 30분
