import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Shop } from './shop.entity';
import { Supplier } from './supplier.entity';
import { Product } from './product.entity';

export enum PurchaseOrderStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.purchaseOrders)
  supplier: Supplier;

  @Column()
  supplierId: string;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  productId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitCost: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalCost: number;

  @Column({ type: 'varchar', default: PurchaseOrderStatus.PENDING })
  status: PurchaseOrderStatus;

  @Column({ nullable: true })
  notes?: string;

  @ManyToOne(() => Shop)
  shop: Shop;

  @Column()
  shopId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
