import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { ActivityService } from '../activity/activity.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly activityService: ActivityService,
  ) {}

  async create(createProductDto: CreateProductDto, shopId: string, userId: string): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      shopId,
      userId,
    });
    const savedProduct = await this.productRepository.save(product);

    await this.activityService.record({
      shopId,
      userId,
      action: 'created',
      entityType: 'product',
      entityId: savedProduct.id,
      message: `Product created: ${savedProduct.name}`,
      metadata: {
        name: savedProduct.name,
        buyingPrice: savedProduct.buyingPrice,
        sellingPrice: savedProduct.sellingPrice,
        stockQuantity: savedProduct.stockQuantity,
      },
    });

    return savedProduct;
  }

  async findAll(shopId: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { shopId },
      relations: ['shop', 'user', 'sales'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, shopId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, shopId },
      relations: ['shop', 'user', 'sales'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findByBarcode(barcode: string, shopId: string): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { barcode, shopId },
      relations: ['shop', 'user'],
    });
  }

  async findLowStock(shopId: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.shopId = :shopId', { shopId })
      .andWhere('product.stockQuantity <= product.lowStockThreshold')
      .getMany();
  }

  async update(id: string, shopId: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const current = await this.findOne(id, shopId);
    await this.productRepository.update({ id, shopId }, updateProductDto);
    const updated = await this.findOne(id, shopId);

    await this.activityService.record({
      shopId,
      action: 'updated',
      entityType: 'product',
      entityId: id,
      message: `Product updated: ${updated.name}`,
      metadata: {
        before: {
          name: current.name,
          buyingPrice: current.buyingPrice,
          sellingPrice: current.sellingPrice,
          stockQuantity: current.stockQuantity,
        },
        after: {
          name: updated.name,
          buyingPrice: updated.buyingPrice,
          sellingPrice: updated.sellingPrice,
          stockQuantity: updated.stockQuantity,
        },
      },
    });

    return updated;
  }

  async updateStock(
    id: string,
    shopId: string,
    quantity: number,
    reason = 'manual_adjustment',
    userId?: string,
  ): Promise<Product> {
    const product = await this.findOne(id, shopId);
    const beforeQuantity = Number(product.stockQuantity);
    const signedQuantity = Number(quantity || 0);
    const afterQuantity = beforeQuantity + signedQuantity;

    if (afterQuantity < 0) {
      throw new BadRequestException('Stock cannot go below zero');
    }

    product.stockQuantity = afterQuantity;
    const updated = await this.productRepository.save(product);

    await this.activityService.record({
      shopId,
      userId,
      action: 'stock_adjustment',
      entityType: 'product',
      entityId: id,
      message: `Stock ${signedQuantity >= 0 ? 'increased' : 'decreased'} for ${product.name}: ${Math.abs(signedQuantity)} units (${reason})`,
      metadata: {
        productName: product.name,
        reason,
        delta: signedQuantity,
        before: beforeQuantity,
        after: Number(updated.stockQuantity),
      },
    });

    return updated;
  }

  async remove(id: string, shopId: string): Promise<{ message: string }> {
    try {
      const product = await this.findOne(id, shopId);
      const result = await this.productRepository.delete({ id, shopId });
      if (result.affected === 0) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      await this.activityService.record({
        shopId,
        action: 'deleted',
        entityType: 'product',
        entityId: id,
        message: `Product deleted: ${product.name}`,
        metadata: { name: product.name, stockQuantity: product.stockQuantity },
      });

      return { message: 'Product deleted successfully' };
    } catch (err: any) {
      // Foreign key constraint — product has related sales/purchase orders
      if (err?.code === '23503' || err?.message?.includes('foreign key') || err?.message?.includes('violates')) {
        throw new NotFoundException(
          'Cannot delete this product — it has recorded sales or purchase orders. Set stock to 0 instead.'
        );
      }
      throw err;
    }
  }

  async getCategories(shopId: string): Promise<string[]> {
    const results = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .where('product.shopId = :shopId', { shopId })
      .andWhere('product.category IS NOT NULL')
      .getRawMany();
    return results.map((r: any) => r.category).filter(Boolean).sort();
  }
}