import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface PlanLimits {
  maxTeams: number;
  maxPlayers: number;
  gamesPerDay: number;
  allowCustomAudio: boolean;
  allowMarketplaceSell: boolean;
  allowFinale: boolean;
  cloudStorageMb: number;
}

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', default: 0 })
  priceCents: number;

  @Column({ default: 'EUR' })
  currency: string;

  @Column({ type: 'jsonb' })
  limits: PlanLimits;

  @Column({ type: 'jsonb', nullable: true })
  features?: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
