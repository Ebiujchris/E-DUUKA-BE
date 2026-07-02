import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto/purchase-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard)
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  create(@Body() dto: CreatePurchaseOrderDto, @Req() req: any) {
    return this.purchaseOrdersService.create({ ...dto, shopId: req.user.shopId });
  }

  @Get()
  findAll(@Req() req: any) {
    return this.purchaseOrdersService.findAll(req.user.shopId);
  }

  @Post(':id/receive')
  receive(@Param('id') id: string, @Req() req: any) {
    return this.purchaseOrdersService.receive(id, req.user.shopId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto, @Req() req: any) {
    return this.purchaseOrdersService.update(id, req.user.shopId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.purchaseOrdersService.remove(id, req.user.shopId);
  }
}
