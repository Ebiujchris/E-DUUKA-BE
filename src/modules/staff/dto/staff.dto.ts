import { IsString, IsEnum, IsOptional, IsPhoneNumber, IsDateString, IsDecimal, IsBoolean } from 'class-validator';
import { StaffRole, StaffStatus } from '../../../entities/staff.entity';

export class CreateStaffDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEnum(StaffRole)
  @IsOptional()
  role?: StaffRole;

  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;

  @IsString()
  @IsOptional()
  idNumber?: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsDecimal()
  @IsOptional()
  salary?: number;

  @IsDateString()
  @IsOptional()
  hireDate?: string;

  @IsBoolean()
  @IsOptional()
  canAccessInventory?: boolean;

  @IsBoolean()
  @IsOptional()
  canApproveCredits?: boolean;

  @IsBoolean()
  @IsOptional()
  canViewReports?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  shopId: string;
}

export class UpdateStaffDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(StaffRole)
  @IsOptional()
  role?: StaffRole;

  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;

  @IsDecimal()
  @IsOptional()
  salary?: number;

  @IsBoolean()
  @IsOptional()
  canAccessInventory?: boolean;

  @IsBoolean()
  @IsOptional()
  canApproveCredits?: boolean;

  @IsBoolean()
  @IsOptional()
  canViewReports?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
