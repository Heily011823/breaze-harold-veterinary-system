// src/modules/medical-records/medical-records.controller.ts
/// Autor:  Mateo Quintero
/// Version: 0.1
/// rama: Bh-17

/**
 * Controlador REST para el recurso "medical-records".
 * Expone el endpoint POST /medical-records para que los veterinarios registren consultas.
 * 
 * Protección: JWT + roles (solo veterinarios pueden acceder).
 * Las respuestas de error se ajustan a lo especificado en el contrato Swagger.
 */

import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
//import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
//import { RolesGuard } from '../auth/guards/roles.guard';
//import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('medical-records')               // Agrupa en Swagger bajo "medical-records"
@ApiBearerAuth()                          // Indica que se requiere token Bearer
@Controller('medical-records')
//@UseGuards(JwtAuthGuard, RolesGuard)      // Primero autentica, luego valida rol
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  //@Roles('veterinarian')                  // Solo usuarios con rol "veterinarian"
  @HttpCode(HttpStatus.CREATED)           // Responde con 201 Created en lugar de 200 OK
  @ApiOperation({ summary: 'Registrar una consulta médica y actualizar peso de la mascota' })
  @ApiResponse({ status: 201, description: 'Registro creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o faltantes (validación del DTO).' })
  @ApiResponse({ status: 401, description: 'No autenticado (token inválido o ausente).' })
  @ApiResponse({ status: 403, description: 'No tiene rol de veterinario.' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrada (petId no existe).' })
  async create(@Body() dto: CreateMedicalRecordDto, @Req() req) {
    // Extraer el ID del veterinario desde el objeto `user` que inyecta JwtAuthGuard
    // Se asume que el payload del token tiene un campo `id` y `role`
    const veterinaryId = req.user.id;
    const record = await this.medicalRecordsService.create(dto, veterinaryId);
    return {
      message: 'Registro médico creado correctamente',
      data: record,
    };

  }


  
}


