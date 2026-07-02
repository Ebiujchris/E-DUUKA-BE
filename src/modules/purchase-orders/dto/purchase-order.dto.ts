import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { PurchaseOrderStatus } from '../../../entities/purchase-order.entity';

export class CreatePurchaseOrderDto {
  @IsString()
  supplierId: string;

  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitCost: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePurchaseOrderDto {
  @IsEnum(PurchaseOrderStatus)
  @IsOptional()
  status?: PurchaseOrderStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
