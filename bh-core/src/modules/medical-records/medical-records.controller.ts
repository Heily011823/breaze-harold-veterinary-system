// medical-records/medical-records.controller.ts

/// Autor: Mateo Quintero
/// Historia: BH-17 (registro de consultas) + BH-11 (historial) + BH-4 (RBAC)
/// Version: 3.1
/// Rama: Bh-17

import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard'; // Ajusta la ruta según tu proyecto
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Asume que existe

import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { MedicalRecordsService } from './medical-records.service';

@ApiTags('Medical Records')
@ApiBearerAuth('access-token')
@Controller('medical-records')
@UseGuards(JwtAuthGuard, RolesGuard) // Aplica guards a nivel de controlador
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @Roles(UserRole.VETERINARIAN)
  @ApiOperation({
    summary: 'Registrar consulta médica',
    description:
      'Solo VETERINARIAN puede registrar historiales médicos. El veterinarianId se toma del token.',
  })
  @ApiResponse({ status: 201, description: 'Historial médico registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos (ej. peso negativo, campos vacíos)' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso — solo VETERINARIAN' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrada' })
  async create(@Body() dto: CreateMedicalRecordDto, @Req() req: Request) {
    // Extrae el ID del veterinario desde el usuario autenticado (asumiendo que está en req.user)
    const veterinarianId = (req.user as any)?.id;
    if (!veterinarianId) {
      // Esto normalmente no debería pasar porque el guard de autenticación ya valida, pero por seguridad:
      throw new Error('Usuario no identificado en la request');
    }
    return this.medicalRecordsService.create(dto, veterinarianId);
  }

  @Get('pet/:petId')
  @Roles(UserRole.VETERINARIAN, UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Obtener historial médico de una mascota',
    description: 'Accesible para VETERINARIAN, ADMIN y RECEPTIONIST.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Historial médico paginado y ordenado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrada (opcional)' })
  findByPet(
    @Param('petId') petId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.medicalRecordsService.findByPet(
      petId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Get(':id')
  @Roles(UserRole.VETERINARIAN, UserRole.ADMIN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Obtener registro médico por ID',
    description: 'Accesible para VETERINARIAN, ADMIN y RECEPTIONIST.',
  })
  @ApiResponse({ status: 200, description: 'Registro médico completo' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  findOne(@Param('id') id: string) {
    return this.medicalRecordsService.findOne(id);
  }
}