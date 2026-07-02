import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../../entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async create(dto: CreateSupplierDto & { shopId: string }): Promise<Supplier> {
    const supplier = this.supplierRepository.create(dto);
    return this.supplierRepository.save(supplier);
  }

  async findAll(shopId: string): Promise<Supplier[]> {
    return this.supplierRepository.find({
      where: { shopId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, shopId: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id, shopId } });
    if (!supplier) throw new Error('Supplier not found');
    return supplier;
  }

  async update(id: string, shopId: string, dto: UpdateSupplierDto): Promise<Supplier> {
    await this.supplierRepository.update({ id, shopId }, dto);
    return this.findOne(id, shopId);
  }

  async remove(id: string, shopId: string): Promise<{ message: string }> {
    const result = await this.supplierRepository.delete({ id, shopId });
    if (result.affected === 0) throw new Error('Supplier not found');
    return { message: 'Supplier removed' };
  }
}
