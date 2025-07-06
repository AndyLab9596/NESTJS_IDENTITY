import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class User extends BaseEntity {
  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }

  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'boolean',
    default: false,
    nullable: false,
  })
  isVerified: boolean;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
  })
  password: string;
}
