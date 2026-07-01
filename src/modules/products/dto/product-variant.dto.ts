import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductVariantDto {
  @IsString()
  productId: string;

  @IsString()
  unitName: string; // e.g., "1kg", "0.5kg", "250g"

  @IsNumber()
  @Min(0)
  buyingPrice: number;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;
}

export class UpdateProductVariantDto {
  @IsOptional()
  @IsString()
  unitName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  buyingPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;
}
