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
import { Team } from './team.entity';

export enum GameStatus {
  LOBBY = 'lobby',
  RUNNING = 'running',
  PAUSED = 'paused',
  FINISHED = 'finished',
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  showId: string;

  @Column({ type: 'uuid', nullable: true })
  hostId?: string;

  @ManyToOne(() => Show)
  @JoinColumn({ name: 'showId' })
  show: Show;

  @Column({ unique: true, length: 6 })
  pinCode: string;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.LOBBY,
  })
  status: GameStatus;

  @Column({ type: 'uuid', nullable: true })
  currentRoundId: string;

  @Column({ type: 'uuid', nullable: true })
  currentQuestionId: string;

  @Column({ type: 'timestamp', nullable: true })
  questionStartedAt: Date;

  @OneToMany(() => Team, (team) => team.game)
  teams: Team[];

  @Column({ type: 'int', default: 60 })
  maxTeams: number;

  @Column({ type: 'jsonb', nullable: true })
  state: {
    currentRoundIndex?: number;
    currentQuestionIndex?: number;
    isQuestionActive?: boolean;
    isBuzzerLocked?: boolean;
    finalistTeamIds?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date;
}
