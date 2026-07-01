import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    return this.productsService.create(createProductDto, req.user.shopId, req.user.userId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.productsService.findAll(req.user.shopId);
  }

  @Get('low-stock')
  findLowStock(@Req() req: any) {
    return this.productsService.findLowStock(req.user.shopId);
  }

  @Get('barcode/:barcode')
  findByBarcode(@Param('barcode') barcode: string, @Req() req: any) {
    return this.productsService.findByBarcode(barcode, req.user.shopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.productsService.findOne(id, req.user.shopId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: any,
  ) {
    return this.productsService.update(id, req.user.shopId, updateProductDto);
  }

  @Patch(':id/stock')
  updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Req() req: any,
  ) {
    return this.productsService.updateStock(id, req.user.shopId, quantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.productsService.remove(id, req.user.shopId);
  }
}