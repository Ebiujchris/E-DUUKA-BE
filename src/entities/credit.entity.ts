import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Shop } from './shop.entity';
import { User } from './user.entity';

export enum CreditStatus {
  PENDING = 'pending',
  PARTIALLY_PAID = 'partially_paid',
  FULLY_PAID = 'fully_paid'
}

@Entity('credits')
export class Credit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerName: string;

  @Column({ nullable: true })
  customerPhone?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    enum: CreditStatus,
    default: CreditStatus.PENDING
  })
  status: CreditStatus;

  @Column({ nullable: true })
  dueDate?: Date;

  @ManyToOne(() => Shop, shop => shop.credits)
  shop: Shop;

  @Column()
  shopId: string;

  @ManyToOne(() => User, user => user.credits)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for balance calculation
  get balance(): number {
    return this.totalAmount - this.amountPaid;
  }

  get isOverdue(): boolean {
    return this.dueDate ? new Date() > this.dueDate && this.status !== CreditStatus.FULLY_PAID : false;
  }
}