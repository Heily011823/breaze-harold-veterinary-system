// medical-records/medical-records.controller.ts

/// Autor: Mateo Quintero
/// Historia: BH-17 (registro de consultas) + BH-11 (historial) + BH-4 (RBAC)
/// Version: 3.4
/// Rama: Bh-17

import { Body, Controller, Get, Param, Post, Query, Req, SetMetadata } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { MedicalRecordsService } from './medical-records.service';

// Definición local del enum (mismo valor que en Prisma)
export enum UserRole {
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  VETERINARIAN = 'VETERINARIAN',
  CLIENT = 'CLIENT',
}

// Decorador Roles (simple, para que el código compile)
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@ApiTags('Medical Records')
@ApiBearerAuth('access-token')
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @Roles(UserRole.VETERINARIAN)
  @ApiOperation({
    summary: 'Registrar consulta médica',
    description: 'Solo VETERINARIAN puede registrar historiales médicos. El veterinarianId se toma del token.',
  })
  @ApiResponse({ status: 201, description: 'Historial médico registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos (ej. peso negativo, campos vacíos)' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso — solo VETERINARIAN' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrada' })
  async create(@Body() dto: CreateMedicalRecordDto, @Req() req: Request) {
    // Obtener veterinarianId del token (mientras no haya guard, usamos un ID fijo)
    const veterinarianId = (req.user as any)?.id;
    if (!veterinarianId) {
      console.warn('⚠️ Autenticación no implementada: usando veterinarianId fijo para pruebas');
      const fakeVeterinarianId = '00000000-0000-0000-0000-000000000001';
      return this.medicalRecordsService.create(dto, fakeVeterinarianId);
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
  @ApiResponse({ status: 404, description: 'Mascota no encontrada' })
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