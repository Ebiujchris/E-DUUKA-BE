import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Shop } from './shop.entity';
import { User } from './user.entity';
import { Sale } from './sale.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  buyingPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  sellingPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  stockQuantity: number;

  @Column({ nullable: true })
  barcode?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ default: 5 })
  lowStockThreshold: number;

  @ManyToOne(() => Shop, shop => shop.products)
  shop: Shop;

  @Column()
  shopId: string;

  @ManyToOne(() => User, user => user.products)
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Sale, sale => sale.product)
  sales: Sale[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property for profit calculation
  get profitPerUnit(): number {
    return this.sellingPrice - this.buyingPrice;
  }

  get isLowStock(): boolean {
    return this.stockQuantity <= this.lowStockThreshold;
  }
}