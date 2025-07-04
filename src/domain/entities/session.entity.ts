import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity()
export class Session extends BaseEntity {
  constructor(partial: Partial<Session>) {
    super();
    Object.assign(this, partial);
  }

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  refreshTokenHash: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  userAgent?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  ipAddress?: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isRevoked: boolean;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  user: User;
}
