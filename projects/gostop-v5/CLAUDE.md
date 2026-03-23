# 맞고 고스톱 v5 - AI 고도화

## 목표
v4 기반으로 AI를 고도화하고 게임 경험을 개선하세요.

## v4 기반 유지
- 모든 기능 (멀티플레이어, 사운드, 저장, 통계, 튜토리얼)
- 모든 고급 규칙 (폭탄, 뻑, 자뻑, 피박, 광박, 흔들기, 총통)

## 새로 추가 사항

### 1. AI 시스템 (3단계)
- **Easy**: 랜덤 선택, 전략 없음
- **Medium**: 기본 전략 (매칭 우선, 점수 분석)
- **Hard**: 전략적 사고 (폭탄, 흔들기, 총통 분석, 상대 예측)

### 2. 애니메이션 속도 조절
모든 애니메이션 속도를 1.5배 느리게:
```css
.card-play { animation-duration: 1.2s; }
.bomb { animation-duration: 2.0s; }
.shake { animation-duration: 1.5s; }
```

### 3. 이미지 에셋
- assets/cards/classic/ - 고해상도 (48장)
- assets/cards/simple/ - 심플 (48장)
- 사용자 선택 가능

### 4. 사운드 (선택적)
- assets/sounds/casual/ - 캐주얼한 사운드
- assets/sounds/traditional/ - 트래디셔널 사운드
- 사용자 선택 가능

## 파일 구조
```
gostop-v5/
├── index.html (80KB+)  ← 메인 게임 파일
├── server.js (5KB)           ← 멀티플레이어 서버
└── assets/
    ├── cards/
    │   ├── classic/       ← 48장 PNG
    │   └── simple/          ← 48장 PNG
    └── sounds/
        ├── casual/           ← 8개 MP3
        └── traditional/     ← 8개 MP3
```

## 실행 방법
싱글: 브라우저로 열기
멀티: node server.js 후 접속

You have 60 minutes. Make ALL features working!

When finished:
openclaw system event --text "Done: 맞고 고스톱 v5 AI 고도화 완료" --mode now
