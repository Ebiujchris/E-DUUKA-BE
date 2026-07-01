import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Shop } from './shop.entity';
import { User } from './user.entity';
import { Product } from './product.entity';

export enum PaymentType {
  CASH = 'cash',
  CREDIT = 'credit',
  MOBILE_MONEY = 'mobile_money'
}

export enum SaleStatus {
  ACTIVE = 'active',
  VOIDED = 'voided'
}

export enum VoidReason {
  WRONG_AMOUNT = 'wrong_amount',
  WRONG_PRODUCT = 'wrong_product',
  CUSTOMER_RETURN = 'customer_return',
  DUPLICATE_ENTRY = 'duplicate_entry',
  OTHER = 'other'
}

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'varchar',
    enum: PaymentType,
    default: PaymentType.CASH
  })
  paymentType: PaymentType;

  @Column({ nullable: true })
  customerName?: string;

  @Column({ nullable: true })
  customerPhone?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({
    type: 'varchar',
    default: SaleStatus.ACTIVE
  })
  status: SaleStatus;

  @Column({ nullable: true })
  voidReason?: string;

  @Column({ nullable: true })
  voidedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  voidedAt?: Date;

  @ManyToOne(() => Shop, shop => shop.sales)
  shop: Shop;

  @Column()
  shopId: string;

  @ManyToOne(() => User, user => user.sales)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Product, product => product.sales)
  product: Product;

  @Column()
  productId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for profit calculation
  get profit(): number {
    return (this.unitPrice - (this.product?.buyingPrice || 0)) * this.quantity;
  }
}