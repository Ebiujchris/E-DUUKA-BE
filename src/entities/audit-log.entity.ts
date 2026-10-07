import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shopId: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  actorName?: string;

  @Column()
  entityType: string;

  @Column({ nullable: true })
  entityId?: string;

  @Column()
  action: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
