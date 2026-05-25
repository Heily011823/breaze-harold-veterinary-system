/// Autor: Mateo Quintero
/// Historia: BH-17 (registro de consultas) + BH-4 (RBAC)
/// Versión: 2.0

import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { MedicalRecordsService } from './medical-records.service';

@ApiTags('Medical Records')
@ApiBearerAuth('access-token')
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
  ) {}

  @Post()
  @Roles(UserRole.VETERINARIAN)
  @ApiOperation({
    summary: 'Registrar consulta médica',
    description: 'Solo VETERINARIAN puede registrar historiales médicos.',
  })
  @ApiResponse({ status: 201, description: 'Historial médico registrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Rol sin permiso — solo VETERINARIAN',
  })
  create(@Body() dto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(dto);
  }
}
