import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../../entities/staff.entity';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async create(createStaffDto: CreateStaffDto & { shopId: string }): Promise<Staff> {
    const staff = this.staffRepository.create(createStaffDto);
    return this.staffRepository.save(staff);
  }

  async findAll(shopId: string): Promise<Staff[]> {
    return this.staffRepository.find({ where: { shopId } });
  }

  async findOne(id: string, shopId: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id, shopId } });
    if (!staff) {
      throw new Error('Staff member not found');
    }
    return staff;
  }

  async update(id: string, shopId: string, updateStaffDto: UpdateStaffDto): Promise<Staff> {
    await this.staffRepository.update({ id, shopId }, updateStaffDto);
    return this.findOne(id, shopId);
  }

  async remove(id: string, shopId: string): Promise<{ message: string }> {
    const result = await this.staffRepository.delete({ id, shopId });
    if (result.affected === 0) {
      throw new Error('Staff member not found');
    }
    return { message: 'Staff member removed successfully' };
  }
}
