// src/modules/medical-records/medical-records.service.ts
/// Autor:  Mateo Quintero
/// Version: 0.1
/// rama: Bh-17

/**
 * Servicio responsable de la lógica de negocio para los registros médicos.
 * 
 * Funcionalidades principales:
 * - Validar existencia de la mascota.
 * - Crear un nuevo registro médico (historial clínico) en una transacción.
 * - Actualizar automáticamente el campo `currentWeight` de la mascota.
 * - Emitir un evento asíncrono hacia bh-audit.
 * 
 * Todas las operaciones de escritura se ejecutan dentro de una transacción
 * de base de datos para garantizar consistencia (atomicidad).
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Crea un registro médico y actualiza el peso de la mascota.
   * 
   * @param dto - Datos validados de la consulta (petId, motivo, diagnóstico, peso)
   * @param veterinarianId - ID del veterinario autenticado (extraído del token JWT)
   * @returns El objeto MedicalRecord recién creado con todos sus campos
   * @throws NotFoundException si la mascota no existe
   * @throws BadRequestException si falla la transacción o hay datos inválidos
   */
  async create(dto: CreateMedicalRecordDto, veterinarianId: string) {
    // 1. Verificar que la mascota referenciada exista en la BD
    const pet = await this.prisma.pet.findUnique({
      where: { id: dto.petId },
    });
    if (!pet) {
      throw new NotFoundException(`Mascota con ID ${dto.petId} no encontrada`);
    }

    // 2. Ejecutar transacción: ambas operaciones deben tener éxito o ninguna
    try {
      // Realizamos la transacción y guardamos el resultado
      const result = await this.prisma.$transaction(async (tx) => {
        // 2a. Crear el registro en la tabla medical_records
        // NOTA: El campo en la BD se llama 'currentWeight' (no 'weight')
        const medicalRecord = await tx.medicalRecord.create({
          data: {
            petId: dto.petId,
            veterinarianId: veterinarianId,
            visitReason: dto.visitReason,
            diagnosis: dto.diagnosis,
            currentWeight: dto.weight,  // ← Mapeamos weight del DTO a currentWeight de la BD
          },
        });

        // 2b. Actualizar el último peso conocido de la mascota (cumple criterio de aceptación)
        await tx.pet.update({
          where: { id: dto.petId },
          data: { currentWeight: dto.weight },
        });

        // Retornamos el registro médico completo
        return medicalRecord;
      });

      // 3. Emitir evento asíncrono hacia bh-audit (desacoplamiento)
      //    El servicio de auditoría escuchará 'medical_record.created'
      this.eventEmitter.emit('medical_record.created', {
        medicalRecordId: result.id,
        petId: result.petId,
        veterinarianId: result.veterinarianId,
        visitReason: result.visitReason,
        diagnosis: result.diagnosis,
        currentWeight: result.currentWeight,  
        createdAt: result.createdAt,
      });

      return result;
    } catch (error) {
      // Relanzar excepciones conocidas (NotFound, BadRequest) tal cual
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      // Log del error para depuración (opcional)
      console.error('Error al crear registro médico:', error);
      // Errores inesperados (ej. restricción de BD) se transforman en BadRequest
      throw new BadRequestException('No se pudo crear el registro médico. Verifique los datos.');
    }
  }
}