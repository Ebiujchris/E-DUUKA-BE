import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Shop } from './shop.entity';

export enum AssetCategory {
  EQUIPMENT    = 'equipment',
  FURNITURE    = 'furniture',
  VEHICLE      = 'vehicle',
  ELECTRONICS  = 'electronics',
  LAND         = 'land',
  BUILDING     = 'building',
  OTHER        = 'other',
}

@Entity('fixed_assets')
export class FixedAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', enum: AssetCategory, default: AssetCategory.OTHER })
  category: AssetCategory;

  @Column('decimal', { precision: 12, scale: 2 })
  cost: number;                       // original purchase cost

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  salvageValue: number;               // expected residual value

  @Column({ type: 'int', default: 5 })
  usefulLifeYears: number;            // for straight-line depreciation

  @Column({ type: 'date' })
  acquireDate: Date;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  serialNumber?: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Shop)
  shop: Shop;

  @Column()
  shopId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
