import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto, SupplierPaymentDto } from './dto/supplier.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  create(@Body() dto: CreateSupplierDto, @Req() req: any) {
    return this.suppliersService.create({ ...dto, shopId: req.user.shopId });
  }

  @Get()
  findAll(@Req() req: any) {
    return this.suppliersService.findAll(req.user.shopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.suppliersService.findOne(id, req.user.shopId);
  }

  @Post(':id/pay')
  recordPayment(@Param('id') id: string, @Body() dto: SupplierPaymentDto, @Req() req: any) {
    return this.suppliersService.recordPayment(id, req.user.shopId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto, @Req() req: any) {
    return this.suppliersService.update(id, req.user.shopId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.suppliersService.remove(id, req.user.shopId);
  }
}
