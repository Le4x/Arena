import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game, GameStatus } from '../../database/entities/game.entity';
import { Show } from '../../database/entities/show.entity';
import { customAlphabet } from 'nanoid';
import { MonetizationService } from '../../monetization/monetization.service';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
    private readonly monetizationService: MonetizationService,
  ) {}

  async createGame(showId: string, hostId?: string): Promise<Game> {
    const show = await this.showRepository.findOne({
      where: { id: showId },
      relations: ['rounds', 'rounds.questions'],
    });

    if (!show) {
      throw new NotFoundException('Show non trouvé');
    }

    if (hostId) {
      await this.monetizationService.assertGameCreationAllowed(hostId);
    }

    // Générer un code PIN unique
    const pinCode = await this.generateUniquePinCode();

    const entitlements = hostId
      ? await this.monetizationService.buildEntitlements(hostId)
      : null;
    const maxTeamsByShow = show.settings?.maxTeams || 60;
    const maxTeams = entitlements
      ? Math.min(entitlements.maxTeams, maxTeamsByShow)
      : maxTeamsByShow;

    const game = this.gameRepository.create({
      showId,
      hostId,
      pinCode,
      status: GameStatus.LOBBY,
      maxTeams,
      state: {
        currentRoundIndex: 0,
        currentQuestionIndex: 0,
        isQuestionActive: false,
        isBuzzerLocked: false,
        finalistTeamIds: [],
      },
    });

    return this.gameRepository.save(game);
  }

  async findByPinCode(pinCode: string): Promise<Game | null> {
    return this.gameRepository.findOne({
      where: { pinCode: pinCode.toUpperCase() },
      relations: ['teams', 'teams.players', 'show', 'show.rounds'],
    });
  }

  async findById(id: string): Promise<Game | null> {
    return this.gameRepository.findOne({
      where: { id },
      relations: ['teams', 'teams.players', 'show', 'show.rounds'],
    });
  }

  async startGame(gameId: string): Promise<Game> {
    const game = await this.findById(gameId);
    if (!game) {
      throw new NotFoundException('Game non trouvée');
    }

    game.status = GameStatus.RUNNING;
    game.startedAt = new Date();

    return this.gameRepository.save(game);
  }

  async pauseGame(gameId: string): Promise<Game> {
    const game = await this.findById(gameId);
    if (!game) {
      throw new NotFoundException('Game non trouvée');
    }

    game.status = GameStatus.PAUSED;
    return this.gameRepository.save(game);
  }

  async finishGame(gameId: string): Promise<Game> {
    const game = await this.findById(gameId);
    if (!game) {
      throw new NotFoundException('Game non trouvée');
    }

    game.status = GameStatus.FINISHED;
    game.finishedAt = new Date();

    return this.gameRepository.save(game);
  }

  async updateGameState(gameId: string, state: Partial<Game['state']>): Promise<Game> {
    const game = await this.findById(gameId);
    if (!game) {
      throw new NotFoundException('Game non trouvée');
    }

    game.state = { ...game.state, ...state };
    return this.gameRepository.save(game);
  }

  async setCurrentQuestion(
    gameId: string,
    roundId: string,
    questionId: string,
  ): Promise<Game> {
    const game = await this.findById(gameId);
    if (!game) {
      throw new NotFoundException('Game non trouvée');
    }

    game.currentRoundId = roundId;
    game.currentQuestionId = questionId;
    game.questionStartedAt = new Date();

    return this.gameRepository.save(game);
  }

  private async generateUniquePinCode(): Promise<string> {
    let pinCode: string;
    let exists = true;

    while (exists) {
      pinCode = nanoid();
      const existing = await this.gameRepository.findOne({
        where: { pinCode },
      });
      exists = !!existing;
    }

    return pinCode!;
  }
}
