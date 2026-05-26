// medical-records/medical-records.service.ts

/// Autor: Mateo Quintero
/// Historia: BH-17 (registro de consultas) + BH-11 (historial)
/// Version: 2.1
/// Rama: Bh-17

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

/**
 * Evento que se emitirá hacia bh-audit cuando se cree un nuevo historial médico.
 */
export class MedicalRecordCreatedEvent {
  constructor(
    public readonly medicalRecordId: string,
    public readonly petId: string,
    public readonly veterinarianId: string,
    public readonly timestamp: Date,
  ) {}
}

@Injectable()
export class MedicalRecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Registra una nueva consulta médica, actualiza el peso de la mascota
   * y emite un evento de auditoría.
   */
  async create(dto: CreateMedicalRecordDto, veterinarianId: string) {
  // Verificar que la mascota exista
  const pet = await this.prisma.pet.findUnique({
    where: { id: dto.petId },
  });
  if (!pet) {
    throw new NotFoundException(`Mascota con ID ${dto.petId} no encontrada`);
  }

  // Transacción: crear historial y actualizar peso
  try {
    const result = await this.prisma.$transaction(async (prismaTx) => {
      const medicalRecord = await prismaTx.medicalRecord.create({
        data: {
          petId: dto.petId,
          veterinarianId: veterinarianId,
          visitReason: dto.visitReason,
          diagnosis: dto.diagnosis,
          currentWeight: dto.currentWeight,
        },
      });

      // Actualizar el peso de la mascota (campo 'weight' en Pet)
      await prismaTx.pet.update({
        where: { id: dto.petId },
        data: {
          weight: dto.currentWeight,
        },
      });

      return medicalRecord;
    });

    // Emitir evento de auditoría
    this.eventEmitter.emit(
      'medical_record.created',
      new MedicalRecordCreatedEvent(
        result.id,
        result.petId,
        result.veterinarianId,
        new Date(),
      ),
    );

    return result;
  } catch (error: unknown) {
    // Verificar si es un error de Prisma (tiene propiedad 'code')
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code: string };
      if (prismaError.code === 'P2002' || prismaError.code === 'P2003') {
        throw new BadRequestException('Error de integridad de datos al crear el registro médico');
      }
    }
    throw error;
  }
}

  /**
   * Obtiene historial médico paginado de una mascota (más reciente primero)
   */
  async findByPet(petId: string, page = 1, pageSize = 20) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) {
      throw new NotFoundException(`Mascota con ID ${petId} no encontrada`);
    }

    const skip = (page - 1) * pageSize;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.medicalRecord.findMany({
        where: { petId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.medicalRecord.count({ where: { petId } }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Obtiene un registro médico por su ID
   */
  async findOne(id: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
    });
    if (!record) {
      throw new NotFoundException(`Registro médico con ID ${id} no encontrado`);
    }
    return record;
  }
}