import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SalesModule } from '../sales/sales.module';
import { ProductsModule } from '../products/products.module';
import { CreditsModule } from '../credits/credits.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [SalesModule, ProductsModule, CreditsModule, SuppliersModule, ExpensesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}