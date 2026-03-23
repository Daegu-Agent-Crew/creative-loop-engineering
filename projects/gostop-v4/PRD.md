# 맞고 고스톱 v4 - 멀티플레이어 + 기능 강화

WebSocket 기반 실시간 멀티플레이어 + 효과음 + 통계 시스템

---

## 📋 개요

v3의 모든 기능에 멀티플레이어와 게임 기능을 대폭 강화한 최종 버전.

---

## 🆕 v3 → v4 개선사항

### 멀티플레이어 (옵션 A)
- WebSocket 실시간 대국
- 방 만들기/참가하기
- 온라인 친구와 플레이
- 채팅 기능
- 관전 모드

### 게임 기능 강화 (옵션 C)
- 효과음 (카드, 폭탄, 뻑 등)
- 게임 저장/불러오기
- 통계 시스템 (승률, 평균점수)
- 튜토리얼 모드

---

## ✨ 기능

### 1. 멀티플레이어 시스템

#### 서버 (Node.js)
```javascript
// server.js - WebSocket 서버
const WebSocket = require('ws')

class GoStopServer {
  constructor(port = 8080) {
    this.wss = new WebSocket.Server({ port })
    this.rooms = new Map()  // room_id -> Room
    this.players = new Map()  // ws -> Player
    
    this.wss.on('connection', (ws) => {
      ws.on('message', (data) => this.handleMessage(ws, data))
      ws.on('close', () => this.handleDisconnect(ws))
    })
  }
  
  handleMessage(ws, data) {
    const msg = JSON.parse(data)
    switch(msg.type) {
      case 'create_room':
        this.createRoom(ws, msg)
        break
      case 'join_room':
        this.joinRoom(ws, msg)
        break
      case 'play_card':
        this.playCard(ws, msg)
        break
      case 'chat':
        this.broadcastChat(ws, msg)
        break
    }
  }
  
  createRoom(ws, msg) {
    const roomId = generateRoomId()
    const room = new Room(roomId, msg.password)
    room.addPlayer(ws, msg.playerName)
    this.rooms.set(roomId, room)
    ws.send(JSON.stringify({
      type: 'room_created',
      roomId,
      playerIndex: 0
    }))
  }
  
  joinRoom(ws, msg) {
    const room = this.rooms.get(msg.roomId)
    if (!room || room.isFull()) {
      ws.send(JSON.stringify({ type: 'join_failed' }))
      return
    }
    room.addPlayer(ws, msg.playerName)
    this.broadcast(room, {
      type: 'player_joined',
      playerName: msg.playerName
    })
  }
}
```

#### 클라이언트 (브라우저)
```javascript
class MultiplayerClient {
  constructor() {
    this.ws = null
    this.roomId = null
    this.playerIndex = null
  }
  
  connect(serverUrl) {
    this.ws = new WebSocket(serverUrl)
    this.ws.onmessage = (event) => this.handleMessage(event)
    this.ws.onclose = () => this.handleDisconnect()
  }
  
  createRoom(password = '') {
    this.ws.send(JSON.stringify({
      type: 'create_room',
      playerName: this.playerName,
      password
    }))
  }
  
  joinRoom(roomId, password = '') {
    this.ws.send(JSON.stringify({
      type: 'join_room',
      roomId,
      playerName: this.playerName,
      password
    }))
  }
  
  playCard(cardIndex) {
    this.ws.send(JSON.stringify({
      type: 'play_card',
      cardIndex
    }))
  }
  
  handleMessage(event) {
    const msg = JSON.parse(event.data)
    switch(msg.type) {
      case 'room_created':
        this.onRoomCreated(msg.roomId)
        break
      case 'game_start':
        this.onGameStart(msg)
        break
      case 'card_played':
        this.onCardPlayed(msg)
        break
      case 'chat':
        this.onChat(msg)
        break
    }
  }
}
```

### 2. 효과음 시스템

```javascript
class SoundManager {
  constructor() {
    this.sounds = {}
    this.enabled = true
    this.volume = 0.5
    
    // Web Audio API
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  
  preload() {
    const soundFiles = {
      card_place: 'sounds/card_place.mp3',
      card_flip: 'sounds/card_flip.mp3',
      capture: 'sounds/capture.mp3',
      bomb: 'sounds/bomb.mp3',
      ppuk: 'sounds/ppuk.mp3',
      heundeulgi: 'sounds/heundeulgi.mp3',
      chongtong: 'sounds/chongtong.mp3',
      go: 'sounds/go.mp3',
      stop: 'sounds/stop.mp3',
      win: 'sounds/win.mp3',
      lose: 'sounds/lose.mp3',
      button_click: 'sounds/button_click.mp3'
    }
    
    for (const [name, url] of Object.entries(soundFiles)) {
      this.loadSound(name, url)
    }
  }
  
  play(soundName) {
    if (!this.enabled) return
    const sound = this.sounds[soundName]
    if (sound) {
      sound.currentTime = 0
      sound.volume = this.volume
      sound.play()
    }
  }
  
  // 무료 효과음 사용
  // freesound.org, mixkit.co, zapsplat.com
}
```

### 3. 저장/불러오기

```javascript
class SaveManager {
  save(game) {
    const saveData = {
      version: '4.0',
      timestamp: Date.now(),
      game: {
        deck: game.deck,
        floor: game.floor,
        players: game.players.map(p => ({
          hand: p.hand,
          captured: p.captured,
          score: p.score,
          goCount: p.goCount
        })),
        currentPlayer: game.currentPlayer,
        state: game.state
      }
    }
    
    localStorage.setItem('gostop_save', JSON.stringify(saveData))
    return true
  }
  
  load() {
    const data = localStorage.getItem('gostop_save')
    if (!data) return null
    
    const saveData = JSON.parse(data)
    return saveData.game
  }
  
  quickSave(game) {
    // Ctrl+S로 빠른 저장
    this.save(game)
    this.showNotification('게임 저장됨')
  }
  
  quickLoad() {
    // Ctrl+L로 빠른 불러오기
    const game = this.load()
    if (game) {
      this.showNotification('게임 불러옴')
    }
    return game
  }
}
```

### 4. 통계 시스템

```javascript
class StatisticsManager {
  constructor() {
    this.stats = this.load() || {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      totalScore: 0,
      highestScore: 0,
      averageScore: 0,
      bombCount: 0,
      ppukCount: 0,
      heundeulgiCount: 0,
      chongtongCount: 0,
      averageGameTime: 0
    }
  }
  
  recordGame(result) {
    this.stats.gamesPlayed++
    this.stats.totalScore += result.score
    
    if (result.won) {
      this.stats.wins++
    } else {
      this.stats.losses++
    }
    
    if (result.score > this.stats.highestScore) {
      this.stats.highestScore = result.score
    }
    
    this.stats.averageScore = this.stats.totalScore / this.stats.gamesPlayed
    
    this.save()
  }
  
  getWinRate() {
    return (this.stats.wins / this.stats.gamesPlayed * 100).toFixed(1)
  }
  
  display() {
    return `
      🎮 게임 수: ${this.stats.gamesPlayed}
      🏆 승률: ${this.getWinRate()}%
      📊 평균 점수: ${this.stats.averageScore.toFixed(1)}
      🎯 최고 점수: ${this.stats.highestScore}
      💣 폭탄: ${this.stats.bombCount}회
      🔄 뻑: ${this.stats.ppukCount}회
      👋 흔들기: ${this.stats.heundeulgiCount}회
      🎉 총통: ${this.stats.chongtongCount}회
    `
  }
}
```

### 5. 튜토리얼 모드

```javascript
class Tutorial {
  constructor() {
    this.steps = [
      {
        title: '기본 규칙',
        content: '같은 월의 카드를 매칭해서 가져가세요.',
        highlight: 'floor'
      },
      {
        title: '카드 내기',
        content: '손패에서 카드를 클릭하세요.',
        highlight: 'hand',
        action: () => this.waitForCardPlay()
      },
      {
        title: '점수 계산',
        content: '광 3장 = 3점, 열끗 5장 = 1점',
        highlight: 'score'
      },
      {
        title: '고/스톱',
        content: '3점 이상이면 고 또는 스톱을 선택하세요.',
        highlight: 'gostop-buttons'
      },
      {
        title: '폭탄',
        content: '같은 월 3장으로 4장을 한 번에 가져가세요!',
        highlight: null,
        highlightCards: ['bomb-cards']
      },
      {
        title: '뻑',
        content: '3장이 바닥에 쌓이면 다른 사람이 먹을 수 있어요.',
        highlight: null
      }
    ]
    this.currentStep = 0
  }
  
  nextStep() {
    this.currentStep++
    if (this.currentStep < this.steps.length) {
      this.showStep(this.currentStep)
    } else {
      this.complete()
    }
  }
  
  showStep(index) {
    const step = this.steps[index]
    this.highlight(step.highlight)
    this.showTooltip(step.title, step.content)
  }
}
```

---

## 🎨 UI 추가 요소

### 멀티플레이어 UI
```html
<!-- 방 선택 화면 -->
<div id="lobby">
  <button onclick="createRoom()">방 만들기</button>
  <button onclick="joinRoom()">방 참가</button>
  <input id="room-id" placeholder="방 ID">
  <div id="room-list"></div>
</div>

<!-- 게임 중 UI -->
<div id="game">
  <div id="opponent">
    <span class="player-name">상대방</span>
    <span class="online-status">🟢</span>
  </div>
  
  <div id="chat">
    <div id="messages"></div>
    <input id="chat-input">
    <button onclick="sendChat()">전송</button>
  </div>
</div>
```

### 통계 UI
```html
<div id="statistics">
  <h3>📊 내 통계</h3>
  <div class="stat-row">
    <span>게임 수</span>
    <span id="games-played">0</span>
  </div>
  <div class="stat-row">
    <span>승률</span>
    <span id="win-rate">0%</span>
  </div>
  <div class="stat-row">
    <span>평균 점수</span>
    <span id="avg-score">0</span>
  </div>
</div>
```

---

## 📐 요구사항

### 멀티플레이어
- [x] WebSocket 서버 (Node.js)
- [x] 방 만들기/참가하기
- [x] 실시간 동기화
- [x] 채팅 기능
- [x] 재연결 처리

### 효과음
- [x] 카드 내기/뒤집기 소리
- [x] 폭탄/뻑/흔들기 소리
- [x] 승리/패배 소리
- [x] 음소거 토글

### 저장/불러오기
- [x] localStorage 저장
- [x] 빠른 저장/불러오기 (Ctrl+S/L)
- [x] 자동 저장

### 통계
- [x] 승률 계산
- [x] 평균 점수
- [x] 특수 규칙 사용 횟수
- [x] 통계 화면

### 튜토리얼
- [x] 단계별 가이드
- [x] 하이라이트 표시
- [x] 건너뛰기 옵션

---

## 🚀 파일 구조

```
gostop-v4/
├── index.html          # 클라이언트 (메인)
├── server.js           # WebSocket 서버
├── sounds/             # 효과음 파일
│   ├── card_place.mp3
│   ├── bomb.mp3
│   ├── ppuk.mp3
│   └── ...
└── README.md
```

---

## 🎮 실행 방법

### 싱글플레이어
```
브라우저로 index.html 열기
```

### 멀티플레이어
```bash
# 서버 실행
node server.js

# 브라우저에서 접속
http://localhost:8080
```

---

## 📊 예상 결과

```
파일: index.html (70KB+) + server.js (10KB)
기능: 멀티플레이어 + 효과음 + 통계 + 튜토리얼
라인: 2,500+
```

---

## 🎯 성공 기준

- [ ] WebSocket 서버 정상 작동
- [ ] 2인 실시간 대국 가능
- [ ] 효과음 재생
- [ ] 게임 저장/불러오기
- [ ] 통계 정확히 기록
- [ ] 튜토리얼 완료
