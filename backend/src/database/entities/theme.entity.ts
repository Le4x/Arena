import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('themes')
export class Theme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    correct?: string;
    incorrect?: string;
    background?: string;
  };

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  backgroundImageUrl: string;

  @Column({ nullable: true })
  backgroundVideoUrl: string;

  @Column({ default: 'Inter' })
  fontFamily: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
