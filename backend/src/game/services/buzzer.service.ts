import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuzzerAttempt } from '../../database/entities/buzzer-attempt.entity';
import { Game } from '../../database/entities/game.entity';

@Injectable()
export class BuzzerService {
  constructor(
    @InjectRepository(BuzzerAttempt)
    private readonly buzzerAttemptRepository: Repository<BuzzerAttempt>,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  async buzz(
    questionId: string,
    teamId: string,
    gameId: string,
  ): Promise<{ attempt: BuzzerAttempt; isFirst: boolean }> {
    // Vérifier que le buzzer n'est pas verrouillé
    const game = await this.gameRepository.findOne({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException('Game non trouvée');
    }

    if (game.state?.isBuzzerLocked) {
      throw new BadRequestException('Le buzzer est verrouillé');
    }

    // Vérifier si cette équipe a déjà buzzé pour cette question
    const existingAttempt = await this.buzzerAttemptRepository.findOne({
      where: { questionId, teamId },
    });

    if (existingAttempt) {
      throw new BadRequestException('Vous avez déjà buzzé pour cette question');
    }

    // Vérifier si c'est le premier buzz
    const firstAttempt = await this.buzzerAttemptRepository.findOne({
      where: { questionId },
      order: { timestampMs: 'ASC' },
    });

    const isFirst = !firstAttempt;
    const timestamp = Date.now();

    const attempt = this.buzzerAttemptRepository.create({
      questionId,
      teamId,
      timestampMs: timestamp.toString(),
      isFirst,
    });

    const savedAttempt = await this.buzzerAttemptRepository.save(attempt);

    // Si c'est le premier buzz, verrouiller automatiquement
    if (isFirst) {
      game.state = { ...game.state, isBuzzerLocked: true };
      await this.gameRepository.save(game);
    }

    return { attempt: savedAttempt, isFirst };
  }

  async getBuzzerOrder(questionId: string): Promise<BuzzerAttempt[]> {
    return this.buzzerAttemptRepository.find({
      where: { questionId },
      relations: ['team'],
      order: { timestampMs: 'ASC' },
    });
  }

  async getFirstBuzz(questionId: string): Promise<BuzzerAttempt | null> {
    return this.buzzerAttemptRepository.findOne({
      where: { questionId, isFirst: true },
      relations: ['team'],
    });
  }

  async unlockBuzzer(gameId: string): Promise<void> {
    const game = await this.gameRepository.findOne({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException('Game non trouvée');
    }

    game.state = { ...game.state, isBuzzerLocked: false };
    await this.gameRepository.save(game);
  }

  async lockBuzzer(gameId: string): Promise<void> {
    const game = await this.gameRepository.findOne({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException('Game non trouvée');
    }

    game.state = { ...game.state, isBuzzerLocked: true };
    await this.gameRepository.save(game);
  }

  async resetBuzzersForQuestion(questionId: string): Promise<void> {
    await this.buzzerAttemptRepository.delete({ questionId });
  }
}
