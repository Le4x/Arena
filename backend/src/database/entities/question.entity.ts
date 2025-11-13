import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Round } from './round.entity';
import { Answer } from './answer.entity';
import { BuzzerAttempt } from './buzzer-attempt.entity';

export enum QuestionType {
  BLINDTEST_AUDIO = 'blindtest_audio',
  QCM = 'qcm',
  QCM_MULTI = 'qcm_multi',
  TEXT = 'text',
  NUMERIC = 'numeric',
  SURVEY = 'survey',
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  roundId: string;

  @ManyToOne(() => Round, (round) => round.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roundId' })
  round: Round;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'int', default: 30 })
  timeLimit: number;

  @Column({ type: 'int', default: 100 })
  basePoints: number;

  // Pour les QCM : options sous forme JSON
  @Column({ type: 'jsonb', nullable: true })
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;

  // Pour les questions texte/numérique : réponse correcte
  @Column({ type: 'text', nullable: true })
  correctAnswer: string;

  // Pour les blindtest audio
  @Column({ nullable: true })
  audioUrl: string;

  @Column({ type: 'int', nullable: true })
  audioStartAt: number; // en ms

  @Column({ type: 'int', nullable: true })
  audioDuration: number; // en ms

  @Column({ type: 'text', nullable: true })
  audioTitle: string;

  @Column({ type: 'text', nullable: true })
  audioArtist: string;

  @Column({ nullable: true })
  imageCoverUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    penalty?: number;
    allowSecondBuzz?: boolean;
    autoValidate?: boolean;
    showCorrectAfterAnswer?: boolean;
  };

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  @OneToMany(() => BuzzerAttempt, (attempt) => attempt.question)
  buzzerAttempts: BuzzerAttempt[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
