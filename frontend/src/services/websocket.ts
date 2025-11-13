import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

class WebSocketService {
  private socket: Socket | null = null;
  private gameId: string | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connecté');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket déconnecté');
    });

    this.socket.on('error', (error: any) => {
      console.error('❌ WebSocket erreur:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.gameId = null;
    }
  }

  joinGame(gameId: string, teamId?: string, role: string = 'player') {
    if (!this.socket) this.connect();
    this.gameId = gameId;
    this.socket?.emit('game:join', { gameId, teamId, role });
  }

  leaveGame() {
    if (this.socket && this.gameId) {
      this.socket.emit('game:leave');
      this.gameId = null;
    }
  }

  // Buzzer
  pressBuzzer(gameId: string, teamId: string, questionId: string) {
    this.socket?.emit('buzzer:press', { gameId, teamId, questionId });
  }

  // Answer
  submitAnswer(
    gameId: string,
    teamId: string,
    questionId: string,
    payload: any
  ) {
    this.socket?.emit('answer:submit', { gameId, teamId, questionId, payload });
  }

  // Régie controls
  startQuestion(gameId: string, roundId: string, questionId: string) {
    this.socket?.emit('regie:start-question', { gameId, roundId, questionId });
  }

  stopQuestion(gameId: string) {
    this.socket?.emit('regie:stop-question', { gameId });
  }

  validateAnswer(
    gameId: string,
    answerId: string,
    status: string,
    customPoints?: number
  ) {
    this.socket?.emit('regie:validate-answer', {
      gameId,
      answerId,
      status,
      customPoints,
    });
  }

  updateScore(gameId: string, teamId: string, points: number) {
    this.socket?.emit('regie:update-score', { gameId, teamId, points });
  }

  // Event listeners
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }
}

export const wsService = new WebSocketService();
