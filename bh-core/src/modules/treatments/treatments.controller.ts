// treatments/treatments.controller.ts

/// Autor: Mateo Quintero
/// Version: 0.1
/// Rama: Bh-18

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { TreatmentsService } from './treatments.service';

@ApiTags('Medical Records / Treatments')
@ApiBearerAuth('access-token')
@Controller('medical-records/:recordId/treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar un tratamiento asociado a un historial médico',
    description: 'Agrega un tratamiento a un historial médico existente. La fecha de próxima visita es opcional (puede omitirse).',
  })
  @ApiResponse({ status: 201, description: 'Tratamiento registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos (descripción vacía o fecha mal formateada)' })
  @ApiResponse({ status: 404, description: 'Historial médico no encontrado' })
  async create(
    @Param('recordId') recordId: string,
    @Body() dto: CreateTreatmentDto,
  ) {
    return this.treatmentsService.create(recordId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los tratamientos de un historial médico',
  })
  @ApiResponse({ status: 200, description: 'Lista de tratamientos' })
  @ApiResponse({ status: 404, description: 'Historial médico no encontrado (opcional)' })
  async findAll(@Param('recordId') recordId: string) {
    // Aquí podrías verificar existencia antes de listar, pero el servicio ya lanza 404 si no existe
    return this.treatmentsService.findByMedicalRecord(recordId);
  }
}