// 맞고 고스톱 v5 - Multiplayer Server
const http = require('http');
const fs = require('fs');
const path = require('path');

let WebSocket;
try { WebSocket = require('ws'); } catch(e) {
  console.log('ws 모듈이 필요합니다: npm install ws');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const rooms = new Map();
let nextRoomId = 1;

// HTTP server for serving static files
const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);
  const ext = path.extname(filePath);
  const types = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg','.json':'application/json'};
  const contentType = types[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {'Content-Type': contentType, 'Access-Control-Allow-Origin': '*'});
    res.end(data);
  });
});

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.id = Math.random().toString(36).substr(2, 8);
  ws.playerName = '플레이어';
  ws.roomId = null;
  ws.isAlive = true;

  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      handleMessage(ws, msg);
    } catch(e) {
      console.error('Invalid message:', e);
    }
  });

  ws.on('close', () => {
    if (ws.roomId) leaveRoom(ws);
  });

  // Send room list on connect
  sendRoomList(ws);
});

// Heartbeat
const heartbeat = setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => clearInterval(heartbeat));

function handleMessage(ws, msg) {
  switch(msg.type) {
    case 'join':
      ws.playerName = (msg.name || '플레이어').substring(0, 12);
      sendRoomList(ws);
      break;

    case 'createRoom':
      const roomId = 'room_' + (nextRoomId++);
      rooms.set(roomId, {
        id: roomId,
        name: ws.playerName + '의 방',
        players: [ws],
        state: null,
        turn: 0
      });
      ws.roomId = roomId;
      send(ws, {type: 'roomCreated', roomId});
      broadcastRoomList();
      break;

    case 'joinRoom':
      const room = rooms.get(msg.roomId);
      if (!room || room.players.length >= 2) {
        send(ws, {type: 'error', message: '방에 입장할 수 없습니다'});
        return;
      }
      room.players.push(ws);
      ws.roomId = msg.roomId;
      broadcastRoomList();

      // Start game if 2 players
      if (room.players.length === 2) {
        room.state = initGameState();
        room.players.forEach((p, idx) => {
          send(p, {type: 'gameStart', playerIndex: idx, state: sanitizeState(room.state, idx)});
        });
      }
      break;

    case 'playCard':
      handlePlayCard(ws, msg);
      break;

    case 'goStop':
      handleGoStop(ws, msg);
      break;

    case 'chat':
      const chatRoom = rooms.get(ws.roomId);
      if (chatRoom) {
        chatRoom.players.forEach(p => {
          send(p, {type: 'chatMessage', from: ws.playerName, text: (msg.text||'').substring(0, 100)});
        });
      }
      break;
  }
}

function initGameState() {
  // Create deck
  const deck = Array.from({length: 48}, (_, i) => i);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  const state = {
    deck,
    board: {},
    hands: [[], []],
    captured: [[], []],
    scores: [0, 0],
    goCount: [0, 0],
    currentPlayer: 0,
    turn: 0,
    gameOver: false,
    winner: -1
  };

  // Deal
  for (let i = 0; i < 10; i++) {
    state.hands[0].push(deck.pop());
    state.hands[1].push(deck.pop());
  }
  for (let i = 0; i < 8; i++) {
    const c = deck.pop();
    const m = Math.floor(c / 4); // simplified month calc
    if (!state.board[m]) state.board[m] = [];
    state.board[m].push(c);
  }

  return state;
}

function sanitizeState(state, playerIdx) {
  // Hide opponent's hand
  return {
    board: state.board,
    myHand: state.hands[playerIdx],
    opponentCardCount: state.hands[1 - playerIdx].length,
    captured: state.captured,
    scores: state.scores,
    goCount: state.goCount,
    currentPlayer: state.currentPlayer,
    turn: state.turn,
    deckCount: state.deck.length,
    gameOver: state.gameOver,
    winner: state.winner
  };
}

function handlePlayCard(ws, msg) {
  const room = rooms.get(ws.roomId);
  if (!room || !room.state) return;
  const playerIdx = room.players.indexOf(ws);
  if (playerIdx === -1 || room.state.currentPlayer !== playerIdx) return;

  // Process card play (simplified - full logic would mirror client)
  const cardIdx = msg.card;
  const hand = room.state.hands[playerIdx];
  const idx = hand.indexOf(cardIdx);
  if (idx === -1) return;
  hand.splice(idx, 1);

  // Flip from deck
  const deckCard = room.state.deck.length > 0 ? room.state.deck.pop() : null;

  // Switch turns
  room.state.currentPlayer = 1 - playerIdx;
  room.state.turn++;

  // Check game end
  if (room.state.hands[0].length === 0 && room.state.hands[1].length === 0) {
    room.state.gameOver = true;
  }

  // Broadcast updated state
  room.players.forEach((p, idx) => {
    send(p, {type: 'gameState', state: sanitizeState(room.state, idx), lastPlay: {player: playerIdx, card: cardIdx, deckCard}});
  });
}

function handleGoStop(ws, msg) {
  const room = rooms.get(ws.roomId);
  if (!room || !room.state) return;
  const playerIdx = room.players.indexOf(ws);

  if (msg.decision === 'go') {
    room.state.goCount[playerIdx]++;
    room.players.forEach(p => send(p, {type: 'goDecision', player: playerIdx, decision: 'go'}));
  } else {
    room.state.gameOver = true;
    room.state.winner = playerIdx;
    room.players.forEach(p => send(p, {type: 'gameOver', winner: playerIdx, scores: room.state.scores}));
  }
}

function leaveRoom(ws) {
  const room = rooms.get(ws.roomId);
  if (!room) return;
  room.players = room.players.filter(p => p !== ws);
  if (room.players.length === 0) {
    rooms.delete(ws.roomId);
  } else {
    room.players.forEach(p => send(p, {type: 'playerLeft', message: ws.playerName + '님이 나갔습니다'}));
  }
  ws.roomId = null;
  broadcastRoomList();
}

function send(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function sendRoomList(ws) {
  const list = [];
  rooms.forEach(r => {
    list.push({id: r.id, name: r.name, players: r.players.length});
  });
  send(ws, {type: 'roomList', rooms: list});
}

function broadcastRoomList() {
  const list = [];
  rooms.forEach(r => {
    list.push({id: r.id, name: r.name, players: r.players.length});
  });
  wss.clients.forEach(ws => {
    send(ws, {type: 'roomList', rooms: list});
  });
}

server.listen(PORT, () => {
  console.log(`🎴 맞고 고스톱 v5 서버 실행 중: http://localhost:${PORT}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});
