// prescriptions/prescriptions.controller.ts

/// Autor: Mateo Quintero
/// Version: 0.1
/// Rama: Bh-19

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
//import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrescriptionsService } from './prescriptions.service';

@ApiTags('Prescriptions')
@ApiBearerAuth('access-token')
@Controller('medical-records/:recordId/prescriptions')
//@UseGuards(JwtAuthGuard, RolesGuard) // Comentar si no existen aún
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @Roles(UserRole.VETERINARIAN)
  @ApiOperation({
    summary: 'Registrar prescripciones de medicamentos',
    description: 'Permite registrar uno o varios medicamentos. Si se proporciona productId, descuenta del inventario. Si no, solo guarda como externo.',
  })
  @ApiResponse({ status: 201, description: 'Prescripciones registradas exitosamente' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente o producto no encontrado' })
  @ApiResponse({ status: 404, description: 'MedicalRecord no encontrado' })
  async create(
    @Param('recordId') recordId: string,
    @Body() prescriptions: CreatePrescriptionDto[],
  ) {
    return this.prescriptionsService.create(recordId, prescriptions);
  }

  @Get()
  @Roles(UserRole.VETERINARIAN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Obtener todas las prescripciones de un historial médico' })
  @ApiResponse({ status: 200, description: 'Lista de prescripciones' })
  async findAll(@Param('recordId') recordId: string) {
    return this.prescriptionsService.findByMedicalRecord(recordId);
  }
}