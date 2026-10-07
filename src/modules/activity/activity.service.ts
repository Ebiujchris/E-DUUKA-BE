import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';

interface RecordActivityInput {
  shopId: string;
  action: string;
  entityType: string;
  message: string;
  userId?: string;
  actorName?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async record(input: RecordActivityInput): Promise<AuditLog> {
    const record = this.auditLogRepository.create({
      shopId: input.shopId,
      userId: input.userId,
      actorName: input.actorName,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      message: input.message,
      metadata: input.metadata ?? {},
    });

    return await this.auditLogRepository.save(record);
  }

  async findAll(shopId: string): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { shopId },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
}
