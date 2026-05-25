// Autor original: Mateo Quintero
// BH-11 (consulta historial): Jacobo
// Version: 0.2

import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { MedicalRecordsService } from './medical-records.service';

@ApiTags('Medical Records')
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar consulta medica' })
  @ApiResponse({ status: 201, description: 'Registro creado exitosamente' })
  create(@Body() dto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(dto);
  }

  @Get('pet/:petId')
  @ApiOperation({ summary: 'Obtener historial medico de una mascota (BH-11, solo lectura)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Historial medico paginado, ordenado cronologicamente' })
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
  @ApiOperation({ summary: 'Obtener registro medico por id (BH-11, solo lectura)' })
  @ApiResponse({ status: 200, description: 'Registro medico completo' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }
}
