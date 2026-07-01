import { IsEnum, IsOptional, IsDecimal, IsString, IsDateString } from 'class-validator';
import { ExpenseCategory } from '../../../entities/expense.entity';

export class CreateExpenseDto {
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsDecimal()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsString()
  @IsOptional()
  receiptNumber?: string;

  @IsDateString()
  expenseDate: string;

  @IsString()
  @IsOptional()
  approvedBy?: string;

  @IsString()
  shopId: string;
}

export class UpdateExpenseDto {
  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;

  @IsDecimal()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsDateString()
  @IsOptional()
  expenseDate?: string;

  @IsString()
  @IsOptional()
  approvedBy?: string;
}
