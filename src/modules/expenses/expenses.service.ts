import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense } from '../../entities/expense.entity';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expenseRepository.create(createExpenseDto);
    return this.expenseRepository.save(expense);
  }

  async findAll(shopId: string): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: { shopId },
      order: { expenseDate: 'DESC' },
    });
  }

  async findOne(id: string, shopId: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({ where: { id, shopId } });
    if (!expense) {
      throw new Error('Expense not found');
    }
    return expense;
  }

  async findByDateRange(
    shopId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: {
        shopId,
        expenseDate: Between(startDate, endDate),
      },
      order: { expenseDate: 'DESC' },
    });
  }

  async update(
    id: string,
    shopId: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    await this.expenseRepository.update({ id, shopId }, updateExpenseDto);
    return this.findOne(id, shopId);
  }

  async remove(id: string, shopId: string): Promise<{ message: string }> {
    const result = await this.expenseRepository.delete({ id, shopId });
    if (result.affected === 0) {
      throw new Error('Expense not found');
    }
    return { message: 'Expense removed successfully' };
  }

  async getTotalExpenses(shopId: string): Promise<number> {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.shopId = :shopId', { shopId })
      .getRawOne();
    return parseFloat(result.total) || 0;
  }

  async getExpensesByCategory(shopId: string): Promise<any[]> {
    return this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'total')
      .where('expense.shopId = :shopId', { shopId })
      .groupBy('expense.category')
      .getRawMany();
  }
}
