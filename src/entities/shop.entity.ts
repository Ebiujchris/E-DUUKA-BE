import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Sale } from './sale.entity';
import { Credit } from './credit.entity';
import { Expense } from './expense.entity';
import { Staff } from './staff.entity';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  district?: string;

  @Column({ nullable: true })
  region?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  initialCapital: number;

  @Column({ default: true })
  isActive: boolean;

  // Relations
  @OneToMany(() => User, user => user.shop)
  users: User[];

  @OneToMany(() => Staff, staff => staff.shop)
  staff: Staff[];

  @OneToMany(() => Product, product => product.shop)
  products: Product[];

  @OneToMany(() => Sale, sale => sale.shop)
  sales: Sale[];

  @OneToMany(() => Credit, credit => credit.shop)
  credits: Credit[];

  @OneToMany(() => Expense, expense => expense.shop)
  expenses: Expense[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
