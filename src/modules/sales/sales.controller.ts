import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto, UpdateSaleDto, VoidSaleDto } from './dto/sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto, @Req() req: any) {
    return this.salesService.create(createSaleDto, req.user.shopId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.salesService.findAll(req.user.shopId);
  }

  @Get('today')
  getTodaysSales(@Req() req: any) {
    return this.salesService.getTodaysSales(req.user.shopId);
  }

  @Get('stats')
  getSalesStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    return this.salesService.getSalesStats(
      req.user.shopId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('range')
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    return this.salesService.findByDateRange(
      req.user.shopId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.salesService.findOne(id, req.user.shopId);
  }

  @Post(':id/void')
  voidSale(
    @Param('id') id: string,
    @Body() voidSaleDto: VoidSaleDto,
    @Req() req: any,
  ) {
    return this.salesService.voidSale(id, req.user.shopId, req.user.userId, voidSaleDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
    @Req() req: any,
  ) {
    return this.salesService.update(id, req.user.shopId, updateSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.salesService.remove(id, req.user.shopId);
  }
}