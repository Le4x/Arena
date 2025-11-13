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
import { Theme } from './theme.entity';
import { Round } from './round.entity';

@Entity('shows')
export class Show {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', nullable: true })
  eventDate: Date;

  @Column({ nullable: true })
  venue: string;

  @Column({ type: 'uuid', nullable: true })
  themeId: string;

  @ManyToOne(() => Theme, { nullable: true })
  @JoinColumn({ name: 'themeId' })
  theme: Theme;

  @OneToMany(() => Round, (round) => round.show)
  rounds: Round[];

  @Column({ default: 'fr' })
  defaultLanguage: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    maxTeams?: number;
    maxPlayersPerTeam?: number;
    allowLateJoin?: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
