import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, shopId: string, userId: string): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      shopId,
      userId,
    });
    return await this.productRepository.save(product);
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
    await this.productRepository.update({ id, shopId }, updateProductDto);
    return await this.findOne(id, shopId);
  }

  async updateStock(id: string, shopId: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id, shopId);
    product.stockQuantity -= quantity;
    return await this.productRepository.save(product);
  }

  async remove(id: string, shopId: string): Promise<void> {
    const result = await this.productRepository.delete({ id, shopId });
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}