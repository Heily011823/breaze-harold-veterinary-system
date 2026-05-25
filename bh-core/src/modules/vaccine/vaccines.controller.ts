// vaccines/vaccines.controller.ts

/// Autor: Mateo Quintero
/// Version: 0.1
/// Rama: Bh-20

import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client'; // o usar enum local
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
//import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateVaccineDto } from './dto/create-vaccine.dto';
import { VaccinesService } from './vaccines.service';

@ApiTags('Vaccinations')
@ApiBearerAuth('access-token')
@Controller('vaccines')
//@UseGuards(JwtAuthGuard, RolesGuard) // Se puede comentar temporalmente si no existen los guards
export class VaccinesController {
  constructor(private readonly vaccinesService: VaccinesService) {}

  @Post()
  @Roles(UserRole.VETERINARIAN)
  @ApiOperation({ summary: 'Registrar aplicación de vacuna', description: 'Solo veterinarios. Emite evento a bh-audit.' })
  @ApiResponse({ status: 201, description: 'Vacuna registrada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos (fechas incorrectas)' })
  @ApiResponse({ status: 404, description: 'MedicalRecord no encontrado' })
  async create(@Body() dto: CreateVaccineDto) {
    return this.vaccinesService.create(dto);
  }

  @Get('alerts')
  @Roles(UserRole.VETERINARIAN, UserRole.RECEPTIONIST)
  @ApiOperation({ summary: 'Listar vacunas próximas a vencer', description: 'Útil para planificar llamadas de fidelización.' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30, description: 'Días hacia adelante para filtrar vencimientos' })
  @ApiResponse({ status: 200, description: 'Lista de vacunas con datos de mascota y dueño' })
  async getAlerts(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.vaccinesService.getUpcomingExpirations(daysNum);
  }
}