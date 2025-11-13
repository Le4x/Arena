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
import { Game } from './game.entity';
import { Player } from './player.entity';
import { Answer } from './answer.entity';
import { BuzzerAttempt } from './buzzer-attempt.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  gameId: string;

  @ManyToOne(() => Game, (game) => game.teams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @Column()
  name: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  emoji: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Player, (player) => player.team)
  players: Player[];

  @OneToMany(() => Answer, (answer) => answer.team)
  answers: Answer[];

  @OneToMany(() => BuzzerAttempt, (attempt) => attempt.team)
  buzzerAttempts: BuzzerAttempt[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    tableNumber?: string;
    avatarUrl?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
