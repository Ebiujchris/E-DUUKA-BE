import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Shop } from './shop.entity';

export enum ExpenseCategory {
  RENT = 'rent',
  UTILITIES = 'utilities',
  TRANSPORT = 'transport',
  STOCK_LOSS = 'stock_loss',
  REPAIRS = 'repairs',
  SALARIES = 'salaries',
  ADVERTISING = 'advertising',
  MISCELLANEOUS = 'miscellaneous'
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', enum: ExpenseCategory })
  category: ExpenseCategory;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  supplier?: string;

  @Column({ nullable: true })
  receiptNumber?: string;

  @Column()
  expenseDate: Date;

  @Column({ nullable: true })
  approvedBy?: string;

  @ManyToOne(() => Shop, shop => shop.expenses)
  shop: Shop;

  @Column()
  shopId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
