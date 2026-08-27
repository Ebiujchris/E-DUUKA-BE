import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { StaffRole, StaffStatus } from '../../../entities/staff.entity';

export class CreateStaffDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(StaffRole)
  @IsOptional()
  role?: StaffRole;

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsBoolean()
  @IsOptional()
  canViewDashboard?: boolean;

  @IsBoolean()
  @IsOptional()
  canMakeSales?: boolean;

  @IsBoolean()
  @IsOptional()
  canAccessInventory?: boolean;

  @IsBoolean()
  @IsOptional()
  canApproveCredits?: boolean;

  @IsBoolean()
  @IsOptional()
  canViewReports?: boolean;

  @IsBoolean()
  @IsOptional()
  canManageExpenses?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateStaffDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(StaffRole)
  @IsOptional()
  role?: StaffRole;

  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsBoolean()
  @IsOptional()
  canViewDashboard?: boolean;

  @IsBoolean()
  @IsOptional()
  canMakeSales?: boolean;

  @IsBoolean()
  @IsOptional()
  canAccessInventory?: boolean;

  @IsBoolean()
  @IsOptional()
  canApproveCredits?: boolean;

  @IsBoolean()
  @IsOptional()
  canViewReports?: boolean;

  @IsBoolean()
  @IsOptional()
  canManageExpenses?: boolean;
}
