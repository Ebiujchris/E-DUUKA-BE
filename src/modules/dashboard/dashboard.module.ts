import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SalesModule } from '../sales/sales.module';
import { ProductsModule } from '../products/products.module';
import { CreditsModule } from '../credits/credits.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { Shop } from '../../entities/shop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop]),
    SalesModule, ProductsModule, CreditsModule, SuppliersModule, ExpensesModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}