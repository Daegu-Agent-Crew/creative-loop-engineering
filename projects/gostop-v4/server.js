// 맞고 고스톱 v4 - Multiplayer WebSocket Server
const WebSocket = require("ws");

class GoStopServer {
  constructor(port = 8080) {
    this.wss = new WebSocket.Server({ port });
    this.rooms = new Map();
    this.players = new Map();

    this.wss.on("connection", (ws) => {
      ws.isAlive = true;
      ws.on("pong", () => { ws.isAlive = true; });
      ws.on("message", (data) => this.handleMessage(ws, data));
      ws.on("close", () => this.handleDisconnect(ws));
      ws.on("error", () => this.handleDisconnect(ws));
    });

    // Heartbeat to detect dead connections
    this.heartbeat = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) { ws.terminate(); return; }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on("close", () => clearInterval(this.heartbeat));

    console.log(`GoStop Server running on port ${port}`);
  }

  send(ws, msg) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  handleMessage(ws, data) {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }
    switch (msg.type) {
      case "create_room": this.createRoom(ws, msg); break;
      case "join_room": this.joinRoom(ws, msg); break;
      case "play_card": this.relayAction(ws, msg); break;
      case "draw_result": this.relayAction(ws, msg); break;
      case "go_stop": this.relayAction(ws, msg); break;
      case "match_choice": this.relayAction(ws, msg); break;
      case "bomb_action": this.relayAction(ws, msg); break;
      case "heundeulgi": this.relayAction(ws, msg); break;
      case "game_state": this.relayAction(ws, msg); break;
      case "new_game": this.handleNewGame(ws, msg); break;
      case "chat": this.broadcastChat(ws, msg); break;
      case "list_rooms": this.listRooms(ws); break;
      default: break;
    }
  }

  createRoom(ws, msg) {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = {
      id: roomId,
      players: [ws],
      playerNames: [msg.playerName || "Player 1"],
      password: msg.password || "",
      createdAt: Date.now(),
    };
    this.rooms.set(roomId, room);
    this.players.set(ws, { roomId, index: 0, name: msg.playerName || "Player 1" });
    this.send(ws, { type: "room_created", roomId, playerIndex: 0 });
  }

  joinRoom(ws, msg) {
    const room = this.rooms.get(msg.roomId);
    if (!room) {
      this.send(ws, { type: "join_failed", reason: "방을 찾을 수 없습니다." });
      return;
    }
    if (room.players.length >= 2) {
      this.send(ws, { type: "join_failed", reason: "방이 가득 찼습니다." });
      return;
    }
    if (room.password && room.password !== msg.password) {
      this.send(ws, { type: "join_failed", reason: "비밀번호가 틀렸습니다." });
      return;
    }

    const playerName = msg.playerName || "Player 2";
    room.players.push(ws);
    room.playerNames.push(playerName);
    this.players.set(ws, { roomId: room.id, index: 1, name: playerName });

    // Notify both players that game starts
    // Host (index 0) deals the cards and sends initial state
    room.players.forEach((p, i) => {
      this.send(p, {
        type: "game_start",
        playerIndex: i,
        roomId: room.id,
        playerNames: room.playerNames,
      });
    });
  }

  relayAction(ws, msg) {
    const player = this.players.get(ws);
    if (!player) return;
    const room = this.rooms.get(player.roomId);
    if (!room) return;

    // Relay to the other player
    room.players.forEach((p) => {
      if (p !== ws && p.readyState === WebSocket.OPEN) {
        this.send(p, msg);
      }
    });
  }

  handleNewGame(ws, msg) {
    const player = this.players.get(ws);
    if (!player) return;
    const room = this.rooms.get(player.roomId);
    if (!room) return;

    // Relay new game request to opponent
    room.players.forEach((p) => {
      if (p !== ws) {
        this.send(p, { type: "new_game_request", from: player.name });
      }
    });
  }

  broadcastChat(ws, msg) {
    const player = this.players.get(ws);
    if (!player) return;
    const room = this.rooms.get(player.roomId);
    if (!room) return;

    const chatMsg = {
      type: "chat",
      sender: player.name,
      text: String(msg.text).substring(0, 200),
      timestamp: Date.now(),
    };

    room.players.forEach((p) => {
      this.send(p, chatMsg);
    });
  }

  listRooms(ws) {
    const available = [];
    this.rooms.forEach((room, id) => {
      if (room.players.length < 2) {
        available.push({
          id,
          host: room.playerNames[0],
          hasPassword: !!room.password,
          createdAt: room.createdAt,
        });
      }
    });
    this.send(ws, { type: "room_list", rooms: available });
  }

  handleDisconnect(ws) {
    const player = this.players.get(ws);
    if (!player) return;

    const room = this.rooms.get(player.roomId);
    if (room) {
      // Notify other player
      room.players.forEach((p) => {
        if (p !== ws) {
          this.send(p, { type: "opponent_disconnected", name: player.name });
        }
      });

      // Remove player from room
      room.players = room.players.filter((p) => p !== ws);

      // Clean up empty rooms
      if (room.players.length === 0) {
        this.rooms.delete(player.roomId);
      }
    }

    this.players.delete(ws);
  }
}

const port = parseInt(process.env.PORT || "8080", 10);
new GoStopServer(port);
