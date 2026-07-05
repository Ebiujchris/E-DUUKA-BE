import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, IsBoolean, Min } from 'class-validator';
import { AssetCategory } from '../../../entities/fixed-asset.entity';

export class CreateFixedAssetDto {
  @IsString()
  name: string;

  @IsEnum(AssetCategory)
  @IsOptional()
  category?: AssetCategory;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salvageValue?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  usefulLifeYears?: number;

  @IsDateString()
  acquireDate: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  shopId?: string;
}

export class UpdateFixedAssetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(AssetCategory)
  @IsOptional()
  category?: AssetCategory;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salvageValue?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  usefulLifeYears?: number;

  @IsDateString()
  @IsOptional()
  acquireDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
