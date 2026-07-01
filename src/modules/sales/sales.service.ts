import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sale, SaleStatus } from '../../entities/sale.entity';
import { Credit } from '../../entities/credit.entity';
import { ProductsService } from '../products/products.service';
import { CreateSaleDto, UpdateSaleDto, VoidSaleDto } from './dto/sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(Credit)
    private creditRepository: Repository<Credit>,
    private productsService: ProductsService,
  ) {}

  async create(createSaleDto: CreateSaleDto, shopId: string): Promise<Sale> {
    const product = await this.productsService.findOne(createSaleDto.productId, shopId);
    
    if (product.stockQuantity < createSaleDto.quantity) {
      throw new BadRequestException('Insufficient stock quantity');
    }

    const totalAmount = createSaleDto.unitPrice * createSaleDto.quantity;
    
    const sale = this.saleRepository.create({
      ...createSaleDto,
      totalAmount,
      shopId,
    });

    const savedSale = await this.saleRepository.save(sale);
    
    await this.productsService.updateStock(createSaleDto.productId, shopId, createSaleDto.quantity);
    
    // If payment type is credit, create a credit record
    if (createSaleDto.paymentType === 'credit' && createSaleDto.customerName) {
      const credit = this.creditRepository.create({
        customerName: createSaleDto.customerName,
        customerPhone: createSaleDto.customerPhone,
        totalAmount: totalAmount,
        amountPaid: 0,
        description: `Credit sale for ${product.name} (Qty: ${createSaleDto.quantity})`,
        status: 'pending' as any,
        shopId: shopId,
        userId: createSaleDto.userId,
      });
      
      await this.creditRepository.save(credit);
    }
    
    return await this.findOne(savedSale.id, shopId);
  }

  async findAll(shopId: string): Promise<Sale[]> {
    return await this.saleRepository.find({
      where: { shopId },
      relations: ['shop', 'user', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, shopId: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id, shopId },
      relations: ['shop', 'user', 'product'],
    });
    
    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
    
    return sale;
  }

  async findByDateRange(shopId: string, startDate: Date, endDate: Date): Promise<Sale[]> {
    return await this.saleRepository.find({
      where: {
        shopId,
        createdAt: Between(startDate, endDate),
      },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTodaysSales(shopId: string): Promise<Sale[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return await this.findByDateRange(shopId, startOfDay, endOfDay);
  }

  async getSalesStats(shopId: string, startDate: Date, endDate: Date) {
    const sales = await this.findByDateRange(shopId, startDate, endDate);
    
    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalProfit = sales.reduce((sum, sale) => {
      const buyingPrice = sale.product?.buyingPrice || 0;
      const profit = (sale.unitPrice - buyingPrice) * sale.quantity;
      return sum + profit;
    }, 0);
    const totalTransactions = sales.length;
    
    const cashSales = sales.filter(sale => sale.paymentType === 'cash')
      .reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    const creditSales = sales.filter(sale => sale.paymentType === 'credit')
      .reduce((sum, sale) => sum + sale.totalAmount, 0);

    return {
      totalSales,
      totalProfit,
      totalTransactions,
      cashSales,
      creditSales,
      profitMargin: totalSales > 0 ? (totalProfit / totalSales) * 100 : 0,
    };
  }

  async update(id: string, shopId: string, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    await this.saleRepository.update({ id, shopId }, updateSaleDto);
    return await this.findOne(id, shopId);
  }

  async remove(id: string, shopId: string): Promise<void> {
    const result = await this.saleRepository.delete({ id, shopId });
    if (result.affected === 0) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }
  }

  async voidSale(id: string, shopId: string, userId: string, voidSaleDto: VoidSaleDto): Promise<Sale> {
    const sale = await this.findOne(id, shopId);
    
    if (sale.status === SaleStatus.VOIDED) {
      throw new BadRequestException('Sale is already voided');
    }

    // Restore stock
    const product = await this.productsService.findOne(sale.productId, shopId);
    await this.productsService.updateStock(
      sale.productId,
      shopId,
      -sale.quantity // Negative to add back to stock
    );

    // Update sale status
    sale.status = SaleStatus.VOIDED;
    sale.voidReason = voidSaleDto.reason;
    sale.voidedBy = userId;
    sale.voidedAt = new Date();
    if (voidSaleDto.notes) {
      sale.notes = voidSaleDto.notes;
    }

    return await this.saleRepository.save(sale);
  }
}