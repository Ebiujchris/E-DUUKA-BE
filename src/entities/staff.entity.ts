import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Shop } from './shop.entity';

export enum StaffRole {
  OWNER        = 'owner',
  MANAGER      = 'manager',
  CASHIER      = 'cashier',
  SALES        = 'sales',
  STOCK_KEEPER = 'stock_keeper',
}

export enum StaffStatus {
  ACTIVE   = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
}

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true, select: false })
  password?: string;

  @Column({ type: 'varchar', enum: StaffRole, default: StaffRole.CASHIER })
  role: StaffRole;

  @Column({ type: 'varchar', enum: StaffStatus, default: StaffStatus.ACTIVE })
  status: StaffStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary?: number;

  @Column({ nullable: true })
  hireDate?: Date;

  @Column({ default: true })
  canViewDashboard: boolean;

  @Column({ default: true })
  canMakeSales: boolean;

  @Column({ default: false })
  canAccessInventory: boolean;

  @Column({ default: false })
  canApproveCredits: boolean;

  @Column({ default: false })
  canViewReports: boolean;

  @Column({ default: false })
  canManageExpenses: boolean;

  @Column({ nullable: true })
  notes?: string;

  @ManyToOne(() => Shop, shop => shop.staff)
  shop: Shop;

  @Column()
  shopId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
