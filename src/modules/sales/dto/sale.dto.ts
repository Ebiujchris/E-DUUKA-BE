import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { PaymentType, VoidReason } from '../../../entities/sale.entity';

export class CreateSaleDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string; // If selling a specific variant

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  userId: string;
}

export class UpdateSaleDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class VoidSaleDto {
  @IsEnum(VoidReason)
  reason: VoidReason;

  @IsOptional()
  @IsString()
  notes?: string;
}