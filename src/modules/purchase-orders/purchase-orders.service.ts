import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from '../../entities/purchase-order.entity';
import { Product } from '../../entities/product.entity';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto } from './dto/purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private poRepository: Repository<PurchaseOrder>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(dto: CreatePurchaseOrderDto & { shopId: string }): Promise<PurchaseOrder> {
    const totalCost = dto.quantity * dto.unitCost;
    const order = this.poRepository.create({ ...dto, totalCost });
    return this.poRepository.save(order);
  }

  async findAll(shopId: string): Promise<PurchaseOrder[]> {
    return this.poRepository.find({
      where: { shopId },
      relations: ['supplier', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async receive(id: string, shopId: string): Promise<PurchaseOrder> {
    const order = await this.poRepository.findOne({ where: { id, shopId }, relations: ['product'] });
    if (!order) throw new Error('Purchase order not found');
    if (order.status === PurchaseOrderStatus.RECEIVED) throw new Error('Order already received');

    // Add stock to product
    const product = await this.productRepository.findOne({ where: { id: order.productId } });
    if (product) {
      product.stockQuantity = Number(product.stockQuantity) + Number(order.quantity);
      await this.productRepository.save(product);
    }

    order.status = PurchaseOrderStatus.RECEIVED;
    return this.poRepository.save(order);
  }

  async update(id: string, shopId: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    await this.poRepository.update({ id, shopId }, dto);
    const order = await this.poRepository.findOne({ where: { id, shopId }, relations: ['supplier', 'product'] });
    if (!order) throw new Error('Purchase order not found');
    return order;
  }

  async remove(id: string, shopId: string): Promise<{ message: string }> {
    const result = await this.poRepository.delete({ id, shopId });
    if (result.affected === 0) throw new Error('Purchase order not found');
    return { message: 'Purchase order removed' };
  }
}
