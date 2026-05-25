// vaccines/vaccines.service.ts

/// Autor: Mateo Quintero
/// Version: 0.1
/// Rama: Bh-20

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVaccineDto } from './dto/create-vaccine.dto';

export class VaccineCreatedEvent {
  constructor(
    public readonly vaccineId: string,
    public readonly petId: string,
    public readonly vaccineName: string,
    public readonly nextDueDate: Date,
    public readonly timestamp: Date,
  ) {}
}

@Injectable()
export class VaccinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Registra una vacuna asociada a un historial médico.
   * Valida fechas, obtiene el petId automáticamente y emite evento a bh-audit.
   */
  async create(dto: CreateVaccineDto) {
    // 1. Verificar que el medicalRecord existe y obtener el petId
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id: dto.medicalRecordId },
      select: { petId: true },
    });
    if (!medicalRecord) {
      throw new NotFoundException(`MedicalRecord con ID ${dto.medicalRecordId} no encontrado`);
    }

    // 2. Validar fechas
    const applicationDate = new Date(dto.applicationDate);
    const nextDueDate = new Date(dto.nextDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (applicationDate > today) {
      throw new BadRequestException('La fecha de aplicación no puede ser futura');
    }
    if (nextDueDate <= applicationDate) {
      throw new BadRequestException('La fecha de próximo refuerzo debe ser posterior a la fecha de aplicación');
    }

    // 3. Crear la vacuna en la base de datos
    const vaccine = await this.prisma.vaccine.create({
      data: {
        vaccineName: dto.vaccineName,
        applicationDate,
        nextDueDate,
        medicalRecordId: dto.medicalRecordId,
        petId: medicalRecord.petId,
      },
    });

    // 4. Emitir evento para bh-audit
    this.eventEmitter.emit(
      'vaccine.created',
      new VaccineCreatedEvent(
        vaccine.id,
        vaccine.petId,
        vaccine.vaccineName,
        vaccine.nextDueDate,
        new Date(),
      ),
    );

    return vaccine;
  }

  /**
   * Obtiene las vacunas que vencen en un período de días (próximos vencimientos).
   * @param days - Número de días hacia adelante (default 30)
   * @returns Lista de vacunas con datos de mascota y dueño para contacto.
   */
  async getUpcomingExpirations(days: number = 30) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limitDate = new Date();
    limitDate.setDate(today.getDate() + days);
    limitDate.setHours(23, 59, 59, 999);

    const vaccines = await this.prisma.vaccine.findMany({
      where: {
        nextDueDate: {
          gte: today,
          lte: limitDate,
        },
      },
      include: {
        pet: {
          include: {
            client: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
      orderBy: { nextDueDate: 'asc' },
    });

    return vaccines.map(v => ({
      id: v.id,
      vaccineName: v.vaccineName,
      applicationDate: v.applicationDate,
      nextDueDate: v.nextDueDate,
      pet: {
        id: v.pet.id,
        name: v.pet.name,
        species: v.pet.species,
        owner: v.pet.client,
      },
    }));
  }
}