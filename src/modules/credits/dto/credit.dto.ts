import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';
import { CreditStatus } from '../../../entities/credit.entity';

export class CreateCreditDto {
  @IsString()
  customerName: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsString()
  userId: string;
}

export class UpdateCreditDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CreditStatus)
  status?: CreditStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class PayCreditDto {
  @IsNumber()
  @Min(0)
  amount: number;
}