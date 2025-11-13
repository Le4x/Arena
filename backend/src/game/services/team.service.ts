import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../database/entities/team.entity';
import { Player } from '../../database/entities/player.entity';
import { Game } from '../../database/entities/game.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  async createTeam(
    gameId: string,
    name: string,
    color?: string,
    emoji?: string,
  ): Promise<Team> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      relations: ['teams'],
    });

    if (!game) {
      throw new NotFoundException('Game non trouvée');
    }

    // Vérifier le nombre max d'équipes
    if (game.teams.length >= game.maxTeams) {
      throw new BadRequestException(
        `Nombre maximum d'équipes atteint (${game.maxTeams})`,
      );
    }

    // Vérifier que le nom n'est pas déjà pris
    const existingTeam = game.teams.find(
      (t) => t.name.toLowerCase() === name.toLowerCase(),
    );
    if (existingTeam) {
      throw new BadRequestException('Ce nom d\'équipe est déjà pris');
    }

    const team = this.teamRepository.create({
      gameId,
      name,
      color: color || this.getRandomColor(),
      emoji: emoji || this.getRandomEmoji(),
      score: 0,
    });

    return this.teamRepository.save(team);
  }

  async findById(teamId: string): Promise<Team | null> {
    return this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['players', 'game'],
    });
  }

  async findByGameId(gameId: string): Promise<Team[]> {
    return this.teamRepository.find({
      where: { gameId },
      relations: ['players'],
      order: { score: 'DESC' },
    });
  }

  async addPlayerToTeam(
    teamId: string,
    nickname: string,
    deviceId?: string,
  ): Promise<Player> {
    const team = await this.findById(teamId);
    if (!team) {
      throw new NotFoundException('Équipe non trouvée');
    }

    const player = this.playerRepository.create({
      teamId,
      nickname,
      deviceId,
      isConnected: true,
      lastSeenAt: new Date(),
    });

    return this.playerRepository.save(player);
  }

  async updatePlayerConnection(
    playerId: string,
    isConnected: boolean,
  ): Promise<Player> {
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
    });

    if (!player) {
      throw new NotFoundException('Joueur non trouvé');
    }

    player.isConnected = isConnected;
    player.lastSeenAt = new Date();

    return this.playerRepository.save(player);
  }

  async updateTeamScore(teamId: string, points: number): Promise<Team> {
    const team = await this.findById(teamId);
    if (!team) {
      throw new NotFoundException('Équipe non trouvée');
    }

    team.score += points;
    return this.teamRepository.save(team);
  }

  async setTeamScore(teamId: string, score: number): Promise<Team> {
    const team = await this.findById(teamId);
    if (!team) {
      throw new NotFoundException('Équipe non trouvée');
    }

    team.score = score;
    return this.teamRepository.save(team);
  }

  async getLeaderboard(gameId: string, limit?: number): Promise<Team[]> {
    const query = this.teamRepository
      .createQueryBuilder('team')
      .where('team.gameId = :gameId', { gameId })
      .orderBy('team.score', 'DESC')
      .leftJoinAndSelect('team.players', 'players');

    if (limit) {
      query.limit(limit);
    }

    return query.getMany();
  }

  private getRandomColor(): string {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E2',
      '#F8B739',
      '#52B788',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getRandomEmoji(): string {
    const emojis = [
      '🚀',
      '⚡',
      '🔥',
      '🎯',
      '🌟',
      '💫',
      '🎸',
      '🎤',
      '🎵',
      '🎶',
      '🎹',
      '🥁',
      '🎺',
      '🎷',
    ];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }
}
