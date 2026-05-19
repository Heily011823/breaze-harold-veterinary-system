import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { AuditEvent, ActionType, UserRole } from './entities/audit-event.entity';
import { CreateAuditEventDto } from './dto/create-audit-event.dto';

export interface FindEventsFilter {
  actionType?: ActionType;
  userId?: string;
  userRole?: UserRole;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditEvent)
    private readonly auditEventRepository: Repository<AuditEvent>,
  ) {}

  async create(createAuditEventDto: CreateAuditEventDto): Promise<AuditEvent> {
    const event = this.auditEventRepository.create(createAuditEventDto);
    return await this.auditEventRepository.save(event);
  }

  async findAll(filters: FindEventsFilter) {
    const {
      actionType,
      userId,
      userRole,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;

    const where: FindOptionsWhere<AuditEvent> = {};

    if (actionType) where.actionType = actionType;
    if (userId) where.userId = userId;
    if (userRole) where.userRole = userRole;
    if (startDate && endDate) {
      where.occurredAt = Between(new Date(startDate), new Date(endDate));
    }

    const [data, total] = await this.auditEventRepository.findAndCount({
      where,
      order: { occurredAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}