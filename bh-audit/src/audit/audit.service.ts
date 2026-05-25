import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

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

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

  async findAll(
    filters: FindEventsFilter,
  ): Promise<PaginatedResult<AuditEvent>> {
    const {
      actionType,
      userId,
      userRole,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;

    if (page < 1) {
      throw new BadRequestException('page debe ser mayor a 0');
    }

    if (limit < 1 || limit > 100) {
      throw new BadRequestException('limit debe estar entre 1 y 100');
    }

    if (startDate && isNaN(Date.parse(startDate))) {
      throw new BadRequestException('startDate no es una fecha válida');
    }

    if (endDate && isNaN(Date.parse(endDate))) {
      throw new BadRequestException('endDate no es una fecha válida');
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('startDate no puede ser mayor que endDate');
    }

    const query: SelectQueryBuilder<AuditEvent> =
      this.auditEventRepository.createQueryBuilder('event');

    if (actionType) {
      query.andWhere('event.actionType = :actionType', { actionType });
    }

    if (userId) {
      query.andWhere('event.userId = :userId', { userId });
    }

    if (userRole) {
      query.andWhere('event.userRole = :userRole', { userRole });
    }

    if (startDate) {
      query.andWhere('event.occurredAt >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      query.andWhere('event.occurredAt <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    query
      .orderBy('event.occurredAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}