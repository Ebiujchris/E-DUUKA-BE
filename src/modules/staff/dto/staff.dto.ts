import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsBoolean } from 'class-validator';
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

  @IsNumber()
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

  @IsNumber()
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
