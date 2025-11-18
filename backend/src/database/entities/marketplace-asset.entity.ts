import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('marketplace_assets')
export class MarketplaceAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sellerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', default: 0 })
  priceCents: number;

  @Column({ default: 'EUR' })
  currency: string;

  @Column({ nullable: true })
  coverUrl?: string;

  @Column()
  fileKey: string;

  @Column({ nullable: true })
  manifestPath?: string;

  @Column({ nullable: true })
  checksum?: string;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
