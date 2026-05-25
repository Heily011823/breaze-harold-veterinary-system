import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

/// Autor:  Mateo Quintero 
/// Version: 0.1
/// rama: 17-el registro de consultas

@Injectable()
export class MedicalRecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async create(dto: CreateMedicalRecordDto & { veterinarianId: string }) {
    // Use transaction to create medical record and update pet weight atomically
    const result = await this.prisma.$transaction(async (tx) => {
      // Check if pet exists
      const pet = await tx.pet.findUnique({
        where: { id: dto.petId },
      });

      if (!pet) {
        throw new NotFoundException('Pet not found');
      }

      // Create the medical record
      const medicalRecord = await tx.medicalRecord.create({
        data: {
          petId: dto.petId,
          veterinarianId: dto.veterinarianId,
          visitReason: dto.visitReason,
          diagnosis: dto.diagnosis,
          currentWeight: dto.currentWeight,
        },
      });

      // Update the pet's current weight
      await tx.pet.update({
        where: { id: dto.petId },
        data: { currentWeight: dto.currentWeight },
      });

      return medicalRecord;
    });

    // Emit audit event (fire and don't wait - if audit service is down, we don't want to fail the request)
    this.notifyAuditRecordCreated(dto, result.id).catch((error) => {
      console.error('Failed to notify audit service:', error);
    });

    return result;
  }

  private async notifyAuditRecordCreated(
    dto: CreateMedicalRecordDto & { veterinarianId: string },
    medicalRecordId: string,
  ): Promise<void> {
    try {
      const auditUrl = process.env.BH_AUDIT_URL ?? 'http://localhost:3001';

      await firstValueFrom(
        this.httpService.post(`${auditUrl}/api/v1/audit/events`, {
          actionType: 'MEDICAL_RECORD_CREATED',
          userId: dto.veterinarianId,
          userFullName: 'Veterinarian', // In a real app, we'd fetch the vet's name from the database
          userRole: 'VETERINARIAN',
          description: `Registro médico creado para mascota ID: ${dto.petId}`,
          metadata: {
            medicalRecordId,
            petId: dto.petId,
            visitReason: dto.visitReason,
            diagnosis: dto.diagnosis,
            currentWeight: dto.currentWeight,
          },
        }),
      );
    } catch (error) {
      console.error('Error sending audit event:', error);
      // Don't throw - we don't want audit failures to affect the main operation
    }
  }
}