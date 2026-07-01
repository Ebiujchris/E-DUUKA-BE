import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Shop } from './shop.entity';
import { Product } from './product.entity';
import { Sale } from './sale.entity';
import { Credit } from './credit.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  resetCode?: string;

  @Column({ nullable: true })
  resetCodeExpiry?: Date;

  @ManyToOne(() => Shop, shop => shop.users)
  shop: Shop;

  @Column()
  shopId: string;

  @OneToMany(() => Product, product => product.user)
  products: Product[];

  @OneToMany(() => Sale, sale => sale.user)
  sales: Sale[];

  @OneToMany(() => Credit, credit => credit.user)
  credits: Credit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}