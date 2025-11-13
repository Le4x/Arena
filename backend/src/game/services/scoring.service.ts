import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer, ValidationStatus } from '../../database/entities/answer.entity';
import { Question } from '../../database/entities/question.entity';
import { TeamService } from './team.service';

@Injectable()
export class ScoringService {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    private readonly teamService: TeamService,
  ) {}

  async validateAnswer(
    answerId: string,
    status: ValidationStatus,
    customPoints?: number,
  ): Promise<Answer> {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
      relations: ['question', 'team'],
    });

    if (!answer) {
      throw new Error('Réponse non trouvée');
    }

    answer.validationStatus = status;

    // Calculer les points
    let points = 0;
    if (status === ValidationStatus.CORRECT) {
      points = customPoints ?? answer.question.basePoints;
      if (answer.wasFirstToAnswer) {
        points = Math.round(points * 1.5); // Bonus de rapidité 50%
      }
    } else if (status === ValidationStatus.PARTIAL) {
      points = customPoints ?? Math.round(answer.question.basePoints * 0.5);
    } else if (status === ValidationStatus.INCORRECT) {
      points = -(answer.question.settings?.penalty || 0);
    }

    answer.pointsAwarded = points;

    const savedAnswer = await this.answerRepository.save(answer);

    // Mettre à jour le score de l'équipe
    await this.teamService.updateTeamScore(answer.teamId, points);

    return savedAnswer;
  }

  async submitAnswer(
    teamId: string,
    questionId: string,
    payload: any,
    wasFirstToAnswer: boolean = false,
  ): Promise<Answer> {
    // Vérifier si l'équipe a déjà répondu
    const existing = await this.answerRepository.findOne({
      where: { teamId, questionId },
    });

    if (existing) {
      throw new Error('Cette équipe a déjà répondu à cette question');
    }

    const answer = this.answerRepository.create({
      teamId,
      questionId,
      payload,
      submittedAt: new Date(),
      wasFirstToAnswer,
      validationStatus: ValidationStatus.PENDING,
      pointsAwarded: 0,
    });

    return this.answerRepository.save(answer);
  }

  async getAnswersForQuestion(questionId: string): Promise<Answer[]> {
    return this.answerRepository.find({
      where: { questionId },
      relations: ['team'],
      order: { submittedAt: 'ASC' },
    });
  }

  async autoValidateQCM(questionId: string): Promise<Answer[]> {
    const answers = await this.answerRepository.find({
      where: { questionId },
      relations: ['question', 'team'],
    });

    const validatedAnswers: Answer[] = [];

    for (const answer of answers) {
      const question = answer.question;
      const selectedOptions = answer.payload.selectedOptions || [];
      const correctOptions =
        question.options?.filter((opt) => opt.isCorrect).map((opt) => opt.id) ||
        [];

      const isCorrect =
        selectedOptions.length === correctOptions.length &&
        selectedOptions.every((id: string) => correctOptions.includes(id));

      const status = isCorrect
        ? ValidationStatus.CORRECT
        : ValidationStatus.INCORRECT;

      const validated = await this.validateAnswer(answer.id, status);
      validatedAnswers.push(validated);
    }

    return validatedAnswers;
  }
}
