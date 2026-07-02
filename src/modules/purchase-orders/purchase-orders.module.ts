import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from '../../entities/purchase-order.entity';
import { Product } from '../../entities/product.entity';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder, Product])],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
