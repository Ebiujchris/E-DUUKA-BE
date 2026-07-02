import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Shop } from './shop.entity';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalOwed: number;

  @ManyToOne(() => Shop)
  shop: Shop;

  @Column()
  shopId: string;

  @OneToMany(() => PurchaseOrder, (order) => order.supplier)
  purchaseOrders: PurchaseOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
