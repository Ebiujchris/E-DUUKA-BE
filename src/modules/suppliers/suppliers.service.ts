import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../../entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto, SupplierPaymentDto } from './dto/supplier.dto';

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

  /** Add to supplier's debt (called when a purchase order is received on credit) */
  async addDebt(id: string, shopId: string, amount: number): Promise<Supplier> {
    const supplier = await this.findOne(id, shopId);
    supplier.totalOwed = Number(supplier.totalOwed) + Number(amount);
    return this.supplierRepository.save(supplier);
  }

  /** Record a payment to a supplier, reducing what you owe them */
  async recordPayment(id: string, shopId: string, dto: SupplierPaymentDto): Promise<Supplier> {
    const supplier = await this.findOne(id, shopId);
    const current = Number(supplier.totalOwed);
    if (dto.amount > current) {
      throw new BadRequestException(`Payment (${dto.amount}) exceeds outstanding balance (${current})`);
    }
    supplier.totalOwed = Math.max(0, current - dto.amount);
    return this.supplierRepository.save(supplier);
  }

  async remove(id: string, shopId: string): Promise<{ message: string }> {
    const result = await this.supplierRepository.delete({ id, shopId });
    if (result.affected === 0) throw new Error('Supplier not found');
    return { message: 'Supplier removed' };
  }

  /** Total owed to all suppliers for this shop */
  async getTotalOwed(shopId: string): Promise<number> {
    const suppliers = await this.findAll(shopId);
    return suppliers.reduce((sum, s) => sum + Number(s.totalOwed), 0);
  }
}
