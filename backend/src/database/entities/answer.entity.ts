import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { Question } from './question.entity';

export enum ValidationStatus {
  PENDING = 'pending',
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  PARTIAL = 'partial',
}

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column({ type: 'uuid' })
  questionId: string;

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  // Payload de la réponse (JSON flexible selon le type de question)
  @Column({ type: 'jsonb' })
  payload: {
    selectedOptions?: string[]; // Pour QCM
    textAnswer?: string; // Pour TEXT
    numericAnswer?: number; // Pour NUMERIC
  };

  @Column({
    type: 'enum',
    enum: ValidationStatus,
    default: ValidationStatus.PENDING,
  })
  validationStatus: ValidationStatus;

  @Column({ type: 'int', default: 0 })
  pointsAwarded: number;

  @Column({ type: 'timestamp' })
  submittedAt: Date;

  @Column({ default: false })
  wasFirstToAnswer: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
