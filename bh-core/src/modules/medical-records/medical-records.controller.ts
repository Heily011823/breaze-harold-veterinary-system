/// Autor: Mateo Quintero
/// Historia: BH-17 (registro de consultas) + BH-11 (historial) + BH-4 (RBAC)
/// Versión: 3.0

import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
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

  @Get('pet/:petId')
  @Roles(UserRole.VETERINARIAN, UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Obtener historial médico de una mascota',
    description: 'VETERINARIAN, ADMIN y RECEPTIONIST.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Historial médico paginado, ordenado cronológicamente',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  findByPet(
    @Param('petId') petId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.medicalRecordsService.findByPet(
      petId,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
    );
  }

  @Get(':id')
  @Roles(UserRole.VETERINARIAN, UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Obtener registro médico por ID',
    description: 'VETERINARIAN, ADMIN y RECEPTIONIST.',
  })
  @ApiResponse({ status: 200, description: 'Registro médico completo' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }
}
