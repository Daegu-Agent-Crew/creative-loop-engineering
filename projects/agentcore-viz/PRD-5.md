# Agent Core Viz 5: 🔌 마더보드 회로도

OpenClaw Agent Core를 컴퓨터 마더보드의 회로도로 시각화합니다.

기반 정보: CONTEXT.md 읽을 것.
반드시 $(pwd)/circuit.html 파일에 저장할 것 (터미널 출력 금지).
외부 라이브러리 사용 금지 (순수 HTML/CSS/JS).

## 컨셉

Agent Core를 마더보드 위의 칩/버스/트레이스로 표현. 전기 신호가 회로를 타고 흐르는 모습.

## 구현

### 마더보드 레이아웃
```
┌──────────────────────────────────┐
│  [CPU] Agent Runtime (pi-mono)   │
│  ┌────┐  ┌────┐  ┌────┐         │
│  │ LLM│  │Loop│  │Tool│         │
│  └──┬─┘  └──┬─┘  └──┬─┘         │
│  ══════════════════════          │  ← FSB (Front Side Bus)
│  ┌────┐  ┌────┐  ┌────┐  ┌───┐ │
│  │NIC1│  │NIC2│  │RAM │  │HD │ │
│  │ TG │  │ DC │  │Sess│  │Mem│ │
│  └────┘  └────┘  └────┘  └───┘ │
│  ══════════════════════          │  ← PCI Bus (Queue)
│  ┌────┐  ┌────┐  ┌────┐         │
│  │FW  │  │USB │  │SATA│         │
│  │Tool│  │Plug│  │File│         │
│  └────┘  └────┘  └────┘         │
└──────────────────────────────────┘
```

### 칩 컴포넌트 매핑
- **CPU**: Agent Runtime (pi-mono)
  - Core 1: LLM Inference
  - Core 2: Agent Loop
  - Core 3: Tool Dispatcher
- **NIC**: Channel Adapters (TG, DC, WA 슬롯)
- **RAM**: Session Manager (context window)
- **HDD/SSD**: Memory System (MEMORY.md, memory/)
- **Firmware**: Tool Policy Pipeline
- **PCI Bus**: Queue
- **USB**: Plugin Hooks
- **SATA**: File I/O (read/write/edit)

### 회로 애니메이션
- 전기 신호가 트레이스(연결선)를 따라 이동 (작은 빛 점)
- 칩 활성화 시 LED 글로우
- 버스에 데이터 패킷이 흐름 (1/0 이진수 시각화)

### 시뮬레이션
1. NIC에서 신호 수신 (LED 점등)
2. PCI Bus 통해 CPU로 전달
3. RAM에서 context 로드 (메모리 LED 활성화)
4. CPU 처리 (회전 속도 증가)
5. SATA에서 파일 읽기 (디스크 LED 깜빡)
6. 다시 CPU 처리
7. NIC로 응답 전송

### 시스템 모니터 (오른쪽 패널)
- CPU 사용률 (Agent Runtime 부하)
- RAM 사용량 (Context Window)
- 디스크 I/O (Memory 읽기/쓰기)
- 네트워크 (메시지 송수신)
- 온도 (툴호출 빈도)

### 상세 정보 (칩 클릭)
- 사양 (해당 서브시스템의 기능)
- 핀아웃 (Hook 포인트 목록)
- 연결 버스 (다른 컴포넌트와의 관계)
- Bootstrap Files (RAM 칩 정보)

### 비주얼
- 배경: 어두운 PCB 녹색 (#0a1a0a) 또는 검정
- 트레이스: 금색/구리색 선
- 칩: 검정 사각형 + 핀
- 신호: 네온 녹색 빛 점 이동
- 한국어 UI

### 반응형

## ⏱️ 타임아웃: 30분
