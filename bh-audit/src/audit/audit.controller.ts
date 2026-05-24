import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuditService, FindEventsFilter } from './audit.service';
import { CreateAuditEventDto } from './dto/create-audit-event.dto';
import { ActionType, UserRole } from './entities/audit-event.entity';

@Controller('audit/events')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createAuditEventDto: CreateAuditEventDto) {
    return await this.auditService.create(createAuditEventDto);
  }

  @Get()
  async findAll(
    @Query('actionType') actionType?: ActionType,
    @Query('userId') userId?: string,
    @Query('userRole') userRole?: UserRole,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: FindEventsFilter = {
      actionType,
      userId,
      userRole,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    return await this.auditService.findAll(filters);
  }
}