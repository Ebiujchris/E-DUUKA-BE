import { IsString, IsOptional, IsPhoneNumber, IsBoolean, IsUUID, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsPhoneNumber('UG')
  phone: string;

  @IsString()
  name: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsUUID()
  shopId?: string;

  // For creating a new shop
  @IsOptional()
  @IsString()
  shopName?: string;

  @IsOptional()
  @IsString()
  shopLocation?: string;

  @IsOptional()
  @IsNumber()
  shopInitialCapital?: number;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}