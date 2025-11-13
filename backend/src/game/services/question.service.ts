import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../../database/entities/question.entity';
import { Round } from '../../database/entities/round.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Round)
    private readonly roundRepository: Repository<Round>,
  ) {}

  async findById(id: string): Promise<Question | null> {
    return this.questionRepository.findOne({
      where: { id },
      relations: ['round'],
    });
  }

  async findByRoundId(roundId: string): Promise<Question[]> {
    return this.questionRepository.find({
      where: { roundId },
      order: { order: 'ASC' },
    });
  }

  async getNextQuestion(
    currentQuestionId: string | null,
    roundId: string,
  ): Promise<Question | null> {
    const questions = await this.findByRoundId(roundId);

    if (!currentQuestionId) {
      return questions[0] || null;
    }

    const currentIndex = questions.findIndex((q) => q.id === currentQuestionId);
    if (currentIndex === -1 || currentIndex === questions.length - 1) {
      return null;
    }

    return questions[currentIndex + 1];
  }
}
