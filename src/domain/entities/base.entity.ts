import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class IdentityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}

export abstract class BaseEntity extends IdentityEntity {
  @CreateDateColumn({ select: false })
  createdAt!: Date;

  @UpdateDateColumn({ select: false })
  updatedAt!: Date;

  @Column({ type: 'boolean', default: false, select: false })
  isDeleted!: boolean;
}
