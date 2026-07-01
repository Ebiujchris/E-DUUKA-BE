import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SalesModule } from '../sales/sales.module';
import { ProductsModule } from '../products/products.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [SalesModule, ProductsModule, CreditsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}