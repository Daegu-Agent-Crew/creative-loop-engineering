---
name: team-ralphton
description: "다중 에이전트 병렬 코딩 + 반복 개선 프레임워크. Claude Agent Teams로 골조를 빠르게 만들고, 단일 에이전트 반복으로 세밀하게 다듬습니다. Use when: (1) '팀랄프톤', 'team ralphton', (2) 복잡한 프로젝트 개발, (3) 병렬 코딩 + 점진 개선, (4) '랄프톤 N회', (5) 새 프로젝트 기획+개발. 범용: 웹, API, CLI, 모바일, 게임 등 어떤 프로젝트든 적용 가능."
metadata:
  {
    "openclaw": { "emoji": "👥", "requires": { "anyBins": ["claude"] } },
  }
---

# Team Ralphton (팀 반복랄프톤)

Claude Agent Teams(`--teammate-mode`)로 **다중 에이전트 병렬 코딩** 후, 결과물을 기반으로 **반복 개선**하는 범용 개발 프레임워크.

---

## 🧠 핵심 아이디어

```
Team Ralphton = Agent Teams (병렬) + Iterative Ralphton (반복 개선)

Phase 0: 설계문서 (단일 에이전트)
Phase 1: 팀 병렵 개발 (N 에이전트 동시) → 통합
Run 1~M: 단일 에이전트 반복 개선 (기반 파일 제공)
```

**Teams로 빠르게 골조 만들고 → 반복으로 세밀하게 다듬는다.**

---

## ⚙️ 전제 조건

```bash
# Claude Code v2.1.32+
claude --version

# Agent Teams 활성화
echo '{"env":{"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS":"1"}}' > ~/.claude/settings.json
```

---

## 🔄 전체 워크플로우

```
Step 0: 프로젝트 설정 (디렉토리, PRD 준비)
  ↓
Step 1: Phase 0 - 설계문서 (claude --print)
  → DESIGN.md 생성
  → 보고
  ↓
Step 2: Phase 1 - 팀 병렬 개발 (claude --teammate-mode)
  → Teammate 각자 담당 파일 생성
  → Team Lead 통합
  → 보고 + 체크리스트 검증
  ↓
Step 3: Run 1~N - 반복 개선 (claude --print)
  → 매 Run: 기반 파일 + 개선사항
  → 검증 → 보고 → 자동 다음 Run
  ↓
Step 4: 최종 보고 + 전송
```

---

## 📋 Step 0: 프로젝트 설정

사용자로부터 받은 요구사항으로 PRD.md 생성:

```
필요 정보:
- 프로젝트 이름
- 프로젝트 유형 (웹/API/CLI/게임/라이브러리 등)
- 핵심 기능 목록
- 기술 스택 제약 (있는 경우)
- 품질 기준 (체크리스트)
```

프로젝트 디렉토리 생성: `projects/<이름>/`

---

## 📋 Step 1: Phase 0 - 설계문서

```bash
claude --permission-mode bypassPermissions --print "PRD.md를 읽고 DESIGN.md에 설계문서 작성하라.

포함할 내용:
1. 아키텍처 개요
2. 컴포넌트/모듈 분할
3. 각 모듈의 API 스펙 또는 인터페이스
4. 팀 분할 계획 (누가 무엇을 담당할지)
5. 체크리스트 (검증 가능하도록 구체적)
6. 테스트 시나리오
7. 데이터 구조 (필요한 경우)

반드시 \$(pwd)/DESIGN.md에 저장"
```

완료 후 보고.

---

## 📋 Step 2: Phase 1 - 팀 병렵 개발

### 팀 분할 전략

프로젝트 유형에 따라 자동 분할:

#### 웹 프론트엔드 (싱글 HTML)
```
Teammate A: HTML 구조 + 시뮬레이션/데이터 로직
Teammate B: CSS 애니메이션 + 테마 + 반응형
Teammate C: Canvas 차트 + 데이터 시각화
```

#### 웹 프론트엔드 (멀티 파일)
```
Teammate A: index.html + 라우팅
Teammate B: style.css + 컴포넌트 스타일
Teammate C: app.js + 비즈니스 로직
Teammate D: API 통신 + 데이터 모델
```

#### REST API / 백엔드
```
Teammate A: 라우팅 + 컨트롤러
Teammate B: 모델 + DB 스키마
Teammate C: 미들웨어 + 인증
```

#### CLI 도구
```
Teammate A: CLI 파서 + 커맨드 구조
Teammate B: 핵심 로직 + 처리 함수
Teammate C: 출력 포맷 + 테스트
```

#### 라이브러리 / SDK
```
Teammate A: 핵심 API + 타입 정의
Teammate B: 내부 구현 + 유틸리티
Teammate C: 테스트 + 예제 + 문서
```

#### 게임
```
Teammate A: 게임 엔진 + 루프 + 상태 관리
Teammate B: 렌더링 + 에셋 + 애니메이션
Teammate C: 레벨 디자인 + UI + 사운드
```

#### 모바일 앱
```
Teammate A: 네비게이션 + 화면 구조
Teammate B: 비즈니스 로직 + 상태 관리
Teammate C: API 통신 + 데이터 레이어
```

### TEAM-PRD.md 생성

DESIGN.md 기반으로 팀 역할 분할 문서 생성:

```markdown
# Team PRD - <프로젝트명>

Create an agent team with N teammates.

## Teammate A: <역할명>
- 담당 모듈/파일 목록
- 구체적 구현 요구사항
- 체크리스트 항목

## Teammate B: <역할명>
...

## Teammate C: <역할명>
...

## Rules
- 각 팀원은 자신 파일만 수정
- 기술 스택 제약 준수
- 최종 산출물 형식 지정
```

### 실행

```bash
claude --teammate-mode in-process --permission-mode bypassPermissions \
  -p "$(cat TEAM-PRD.md)

작업 디렉토리: \$(pwd)
DESIGN.md를 읽고 각 팀원의 역할에 맞게 작업할 것.
완료 후 <산출물>로 통합할 것."
```

### 완료 후 검증

```
1. 각 팀원 산출물 존재 확인
2. 통합 파일 완성 확인
3. 체크리스트 검증
4. 보고 (파일별 크기/줄수, 체크리스트 점수)
```

---

## 📋 Step 3: Run 1~N - 반복 개선

### 자동 개선사항 생성

```
출처 1: 체크리스트 실패 항목 → 복구 (최우선)
출처 2: Teams 통합 불일치 → 정리
출처 3: 시간 부족 미구현 → 추가
출처 4: Run 번호별 방향:
  Run 1: 복구 + 기본 기능 보강
  Run 2: 품질/성능/UX 폴리시
  Run 3: 엣지케이스 + 보안 + 접근성
  Run 4+: 사용자 피드백 반영 + 미세 조정
```

### 실행

```bash
claude --permission-mode bypassPermissions --print "
DESIGN.md와 기존 <파일>을 읽고 Run N 개선사항을 반영하여 <파일>에 덮어쓰기 저장하라.

=== Run N 개선사항 ===
<자동 생성된 개선사항>

기존 체크리스트 모두 유지.
반드시 \$(pwd)/<파일>에 덮어쓰기 저장."
```

---

## 📊 체크리스트 검증

python3으로 각 항목을 키워드 매칭으로 검증:

```python
checks = {
    '기능A': 'keyword_a' in code,
    '기능B': 'keyword_b' in code,
    ...
}
```

그룹별 요약 + 총점 보고.

---

## ⏱️ 타이밍 가이드

| 프로젝트 규모 | Teams | 반복 | 총 시간 |
|-------------|-------|------|--------|
| 소형 (<1,000줄) | 2명 | 1회 | ~1시간 |
| 중형 (1,000~3,000줄) | 3명 | 2회 | ~2시간 |
| 대형 (3,000~5,000줄) | 3명 | 3회 | ~3시간 |
| 초대형 (5,000줄+) | 4명 | 3~5회 | ~4~5시간 |

---

## 📝 보고 형식

### Phase 0 보고:
```
📋 Phase 0 (설계) 완료
📦 DESIGN.md: 크기, 줄수
```

### Phase 1 보고 (Teams):
```
📋 Phase 1 (팀 병렬) 완료
📦 최종 산출물: 크기, 줄수
👤 Teammate A: 파일, 크기, 줄수
👤 Teammate B: 파일, 크기, 줄수
👤 Teammate C: 파일, 크기, 줄수
📊 체크리스트: N/M
```

### Run N 보고:
```
📋 Run N 완료
📦 크기, 줄수, 체크리스트
🆕 추가 / ❌ 미달성
📋 Run N+1 자동 시작 (개선사항: ...)
```

### 최종 보고:
```
🏆 프로젝트 완성!
📦 최종 크기, 줄수, 체크리스트
📈 전체 진행 트래커 (Phase 0 → Run N)
📥 텔레그램 전송 완료
```

---

## 🔑 핵심 교훈

### Teams 사용 시
1. **역할 분명히**: 각 팀원 담당 파일/모듈 명확히
2. **통합은 Lead에게**: 팀원은 자기 것만
3. **in-process 모드**: Termux 필수
4. **-p 모드**: 비대화형 자동 실행
5. **프로젝트 유형별 분할**: 웹/API/CLI/게임 등 자동 대응

### 반복 개선 시
6. **기반 파일 제공**: 매 Run에 이전 결과 읽게
7. **보고 생략 금지**: 매 단계마다 보고
8. **N회 상한**: 기본 3회, 최대 5회
9. **코드량 감지**: 줄어들면 유지 지시 강화

### Teams vs 단독 선택
```
Teams가 좋은 경우:
  ✅ 새 프로젝트 (처음부터)
  ✅ 모듈 분리가 자연스러운 구조
  ✅ 빠른 프로토타입 필요

단독이 좋은 경우:
  ✅ 기존 프로젝트 개선
  ✅ 단일 파일 수정
  ✅ 미세한 디테일 작업
```

---

## ⚠️ 제약

- `--teammate-mode`는 **실험적 기능**
- in-process 모드 시각적 제약 (한 터미널)
- 팀원 간 파일 충돌 가능성 → 역할 분리로 최소화
- 토큰 비용 단일 실행보다 높음
- Teams 실패 시 단일 에이전트로 폴백
