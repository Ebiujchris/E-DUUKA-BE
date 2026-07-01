import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @Req() req: any) {
    return this.expensesService.create({
      ...createExpenseDto,
      shopId: req.user.shopId,
    });
  }

  @Get()
  findAll(@Req() req: any) {
    return this.expensesService.findAll(req.user.shopId);
  }

  @Get('by-date-range')
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    return this.expensesService.findByDateRange(
      req.user.shopId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('summary/total')
  getTotalExpenses(@Req() req: any) {
    return this.expensesService.getTotalExpenses(req.user.shopId);
  }

  @Get('summary/by-category')
  getExpensesByCategory(@Req() req: any) {
    return this.expensesService.getExpensesByCategory(req.user.shopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.expensesService.findOne(id, req.user.shopId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Req() req: any,
  ) {
    return this.expensesService.update(id, req.user.shopId, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.expensesService.remove(id, req.user.shopId);
  }
}
