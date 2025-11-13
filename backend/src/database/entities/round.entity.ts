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
import { Show } from './show.entity';
import { Question } from './question.entity';

export enum RoundType {
  QUIZ = 'quiz',
  BLINDTEST = 'blindtest',
  MIXED = 'mixed',
  FINAL = 'final',
}

@Entity('rounds')
export class Round {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  showId: string;

  @ManyToOne(() => Show, (show) => show.rounds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'showId' })
  show: Show;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: RoundType,
    default: RoundType.QUIZ,
  })
  type: RoundType;

  @Column({ type: 'int' })
  order: number;

  @OneToMany(() => Question, (question) => question.round)
  questions: Question[];

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    basePoints?: number;
    speedBonus?: boolean;
    eliminationMode?: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
