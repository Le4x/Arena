import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GameService } from '../game/services/game.service';
import { TeamService } from '../game/services/team.service';
import { BuzzerService } from '../game/services/buzzer.service';
import { ScoringService } from '../game/services/scoring.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/',
})
export class ArenaGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ArenaGateway');

  // Map pour suivre les connexions : socketId -> { gameId, teamId, role }
  private connections = new Map<
    string,
    { gameId: string; teamId?: string; role: string }
  >();

  constructor(
    private readonly gameService: GameService,
    private readonly teamService: TeamService,
    private readonly buzzerService: BuzzerService,
    private readonly scoringService: ScoringService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialisé');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const connection = this.connections.get(client.id);
    if (connection?.teamId) {
      // Informer que le joueur s'est déconnecté
      this.server.to(connection.gameId).emit('player:disconnected', {
        teamId: connection.teamId,
      });
    }
    this.connections.delete(client.id);
    this.logger.log(`Client déconnecté: ${client.id}`);
  }

  // ========== JOIN / LEAVE GAME ==========

  @SubscribeMessage('game:join')
  async handleJoinGame(
    @MessageBody() data: { gameId: string; teamId?: string; role: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId, teamId, role } = data;

    try {
      const game = await this.gameService.findById(gameId);
      if (!game) {
        client.emit('error', { message: 'Game non trouvée' });
        return;
      }

      // Rejoindre la room de la game
      client.join(gameId);
      this.connections.set(client.id, { gameId, teamId, role });

      this.logger.log(
        `Client ${client.id} a rejoint la game ${gameId} en tant que ${role}`,
      );

      // Envoyer l'état actuel de la game
      client.emit('game:state', {
        game,
        teams: await this.teamService.findByGameId(gameId),
      });

      // Notifier les autres participants
      if (teamId) {
        this.server.to(gameId).emit('team:joined', { teamId });
      }
    } catch (error) {
      this.logger.error(`Erreur lors de game:join: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('game:leave')
  async handleLeaveGame(@ConnectedSocket() client: Socket) {
    const connection = this.connections.get(client.id);
    if (connection) {
      client.leave(connection.gameId);
      this.connections.delete(client.id);
    }
  }

  // ========== BUZZER ==========

  @SubscribeMessage('buzzer:press')
  async handleBuzzerPress(
    @MessageBody() data: { gameId: string; teamId: string; questionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId, teamId, questionId } = data;

    try {
      const result = await this.buzzerService.buzz(questionId, teamId, gameId);

      // Notifier toute la game du buzz
      this.server.to(gameId).emit('buzzer:pressed', {
        teamId,
        questionId,
        isFirst: result.isFirst,
        timestamp: result.attempt.timestampMs,
      });

      // Si c'est le premier buzz, le buzzer se verrouille automatiquement
      if (result.isFirst) {
        this.server.to(gameId).emit('buzzer:locked', {
          teamId,
          questionId,
        });
      }

      client.emit('buzzer:success', result);
    } catch (error) {
      this.logger.error(`Erreur buzzer: ${error.message}`);
      client.emit('buzzer:error', { message: error.message });
    }
  }

  // ========== ANSWERS ==========

  @SubscribeMessage('answer:submit')
  async handleAnswerSubmit(
    @MessageBody()
    data: {
      gameId: string;
      teamId: string;
      questionId: string;
      payload: any;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { gameId, teamId, questionId, payload } = data;

    try {
      const answer = await this.scoringService.submitAnswer(
        teamId,
        questionId,
        payload,
        false,
      );

      // Notifier la régie qu'une réponse a été soumise
      this.server.to(gameId).emit('answer:received', {
        teamId,
        questionId,
        answerId: answer.id,
      });

      client.emit('answer:success', { answerId: answer.id });
    } catch (error) {
      this.logger.error(`Erreur answer:submit: ${error.message}`);
      client.emit('answer:error', { message: error.message });
    }
  }

  // ========== REGIE CONTROLS ==========

  @SubscribeMessage('regie:start-question')
  async handleStartQuestion(
    @MessageBody()
    data: {
      gameId: string;
      roundId: string;
      questionId: string;
    },
  ) {
    const { gameId, roundId, questionId } = data;

    try {
      await this.gameService.setCurrentQuestion(gameId, roundId, questionId);
      await this.buzzerService.unlockBuzzer(gameId);

      // Broadcaster à tous les clients
      this.server.to(gameId).emit('question:started', {
        roundId,
        questionId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Erreur regie:start-question: ${error.message}`);
    }
  }

  @SubscribeMessage('regie:stop-question')
  async handleStopQuestion(@MessageBody() data: { gameId: string }) {
    const { gameId } = data;

    try {
      await this.buzzerService.lockBuzzer(gameId);

      this.server.to(gameId).emit('question:stopped', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Erreur regie:stop-question: ${error.message}`);
    }
  }

  @SubscribeMessage('regie:validate-answer')
  async handleValidateAnswer(
    @MessageBody()
    data: {
      gameId: string;
      answerId: string;
      status: string;
      customPoints?: number;
    },
  ) {
    const { gameId, answerId, status, customPoints } = data;

    try {
      const answer = await this.scoringService.validateAnswer(
        answerId,
        status as any,
        customPoints,
      );

      // Récupérer le nouveau classement
      const leaderboard = await this.teamService.getLeaderboard(gameId);

      // Broadcaster la validation et le nouveau classement
      this.server.to(gameId).emit('answer:validated', {
        answerId,
        teamId: answer.teamId,
        status,
        pointsAwarded: answer.pointsAwarded,
        leaderboard,
      });
    } catch (error) {
      this.logger.error(`Erreur regie:validate-answer: ${error.message}`);
    }
  }

  @SubscribeMessage('regie:update-score')
  async handleUpdateScore(
    @MessageBody() data: { gameId: string; teamId: string; points: number },
  ) {
    const { gameId, teamId, points } = data;

    try {
      await this.teamService.updateTeamScore(teamId, points);
      const leaderboard = await this.teamService.getLeaderboard(gameId);

      this.server.to(gameId).emit('score:updated', {
        teamId,
        points,
        leaderboard,
      });
    } catch (error) {
      this.logger.error(`Erreur regie:update-score: ${error.message}`);
    }
  }

  // ========== UTILITY METHODS ==========

  async broadcastToGame(gameId: string, event: string, data: any) {
    this.server.to(gameId).emit(event, data);
  }
}
