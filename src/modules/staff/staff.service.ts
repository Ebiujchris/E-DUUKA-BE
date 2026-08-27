import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../../entities/staff.entity';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async create(dto: CreateStaffDto & { shopId: string }): Promise<Staff> {
    const data = { ...dto } as any;
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const staff = this.staffRepository.create(data);
    return this.staffRepository.save(staff);
  }

  async findAll(shopId: string): Promise<Staff[]> {
    return this.staffRepository.find({ where: { shopId } });
  }

  async findOne(id: string, shopId: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id, shopId } });
    if (!staff) throw new Error('Staff member not found');
    return staff;
  }

  async findByPhone(phone: string): Promise<Staff | null> {
    return this.staffRepository
      .createQueryBuilder('staff')
      .addSelect('staff.password')
      .where('staff.phone = :phone', { phone })
      .getOne();
  }

  async update(id: string, shopId: string, dto: UpdateStaffDto): Promise<Staff> {
    const data = { ...dto } as any;
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    await this.staffRepository.update({ id, shopId }, data);
    return this.findOne(id, shopId);
  }

  async remove(id: string, shopId: string): Promise<{ message: string }> {
    const result = await this.staffRepository.delete({ id, shopId });
    if (result.affected === 0) throw new Error('Staff member not found');
    return { message: 'Staff member removed successfully' };
  }
}
