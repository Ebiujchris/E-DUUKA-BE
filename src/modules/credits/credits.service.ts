import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credit, CreditStatus } from '../../entities/credit.entity';
import { CreateCreditDto, UpdateCreditDto, PayCreditDto } from './dto/credit.dto';

@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(Credit)
    private creditRepository: Repository<Credit>,
  ) {}

  async create(createCreditDto: CreateCreditDto, shopId: string): Promise<Credit> {
    const creditData = {
      ...createCreditDto,
      shopId,
      dueDate: createCreditDto.dueDate ? new Date(createCreditDto.dueDate) : undefined,
    };
    const credit = this.creditRepository.create(creditData);
    return await this.creditRepository.save(credit);
  }

  async findAll(shopId: string): Promise<Credit[]> {
    return await this.creditRepository.find({
      where: { shopId },
      relations: ['shop', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, shopId: string): Promise<Credit> {
    const credit = await this.creditRepository.findOne({
      where: { id, shopId },
      relations: ['shop', 'user'],
    });
    
    if (!credit) {
      throw new NotFoundException(`Credit with ID ${id} not found`);
    }
    
    return credit;
  }

  async findPending(shopId: string): Promise<Credit[]> {
    return await this.creditRepository.find({
      where: { 
        shopId,
        status: CreditStatus.PENDING,
      },
      relations: ['shop', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOverdue(shopId: string): Promise<Credit[]> {
    const today = new Date();
    return await this.creditRepository
      .createQueryBuilder('credit')
      .where('credit.shopId = :shopId', { shopId })
      .andWhere('credit.dueDate < :today', { today })
      .andWhere('credit.status != :status', { status: CreditStatus.FULLY_PAID })
      .getMany();
  }

  async payCredit(id: string, shopId: string, paymentDto: PayCreditDto): Promise<Credit> {
    const credit = await this.findOne(id, shopId);
    
    if (credit.status === CreditStatus.FULLY_PAID) {
      throw new BadRequestException('Credit is already fully paid');
    }

    const currentPaid = Number(credit.amountPaid) || 0;
    const paymentAmount = Number(paymentDto.amount) || 0;
    const totalAmount = Number(credit.totalAmount) || 0;
    const newAmountPaid = currentPaid + paymentAmount;
    
    if (newAmountPaid > totalAmount) {
      throw new BadRequestException('Payment amount exceeds remaining balance');
    }

    credit.amountPaid = newAmountPaid;
    
    // Use a small epsilon for floating point comparison
    const epsilon = 0.01;
    if (Math.abs(newAmountPaid - totalAmount) < epsilon) {
      credit.status = CreditStatus.FULLY_PAID;
    } else if (newAmountPaid > 0) {
      credit.status = CreditStatus.PARTIALLY_PAID;
    }

    return await this.creditRepository.save(credit);
  }

  async getCreditStats(shopId: string) {
    const credits = await this.findAll(shopId);
    
    const totalCredits = credits.reduce((sum, credit) => sum + credit.totalAmount, 0);
    const totalPaid = credits.reduce((sum, credit) => sum + credit.amountPaid, 0);
    const totalOutstanding = totalCredits - totalPaid;
    
    const pendingCredits = credits.filter(credit => credit.status === CreditStatus.PENDING).length;
    const overdueCredits = await this.findOverdue(shopId);

    return {
      totalCredits,
      totalPaid,
      totalOutstanding,
      pendingCredits,
      overdueCredits: overdueCredits.length,
    };
  }

  async update(id: string, shopId: string, updateCreditDto: UpdateCreditDto): Promise<Credit> {
    const updateData = {
      ...updateCreditDto,
      dueDate: updateCreditDto.dueDate ? new Date(updateCreditDto.dueDate) : undefined,
    };
    
    await this.creditRepository.update({ id, shopId }, updateData);
    return await this.findOne(id, shopId);
  }

  async remove(id: string, shopId: string): Promise<void> {
    const result = await this.creditRepository.delete({ id, shopId });
    if (result.affected === 0) {
      throw new NotFoundException(`Credit with ID ${id} not found`);
    }
  }
}