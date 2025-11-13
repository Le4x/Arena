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

@Entity('buzzer_attempts')
export class BuzzerAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  teamId: string;

  @ManyToOne(() => Team, (team) => team.buzzerAttempts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column({ type: 'uuid' })
  questionId: string;

  @ManyToOne(() => Question, (question) => question.buzzerAttempts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ type: 'bigint' })
  timestampMs: string; // Stocké en string pour éviter les problèmes de précision avec bigint

  @Column({ default: false })
  isFirst: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
