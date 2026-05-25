// treatments/treatments.service.ts

/// Autor: Mateo Quintero
/// Version: 0.1
/// Rama: Bh-18

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';

@Injectable()
export class TreatmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Agrega un tratamiento a un historial médico existente.
   * Verifica que el medicalRecord exista antes de crear.
   * @param recordId - ID del historial médico
   * @param dto - Datos del tratamiento (descripción obligatoria, fecha opcional)
   * @returns El tratamiento creado
   * @throws NotFoundException si el medicalRecord no existe
   */
  async create(recordId: string, dto: CreateTreatmentDto) {
    // Verificar que el historial médico existe
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id: recordId },
    });
    if (!medicalRecord) {
      throw new NotFoundException(`Historial médico con ID ${recordId} no encontrado`);
    }

    // Crear el tratamiento asociado
    return this.prisma.treatment.create({
      data: {
        description: dto.description,
        nextVisitDate: dto.nextVisitDate ? new Date(dto.nextVisitDate) : null,
        medicalRecordId: recordId,
      },
    });
  }

  /**
   * Obtiene todos los tratamientos de un historial médico específico.
   * @param recordId - ID del historial médico
   * @returns Lista de tratamientos
   */
  async findByMedicalRecord(recordId: string) {
    return this.prisma.treatment.findMany({
      where: { medicalRecordId: recordId },
      orderBy: { createdAt: 'asc' },
    });
  }
}