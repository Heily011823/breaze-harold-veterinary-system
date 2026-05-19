import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

/// Autor:  Mateo Quintero 
/// Version: 0.1
/// rama: 17-el registro de consultas

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMedicalRecordDto) {
    return this.prisma.medicalRecord.create({
      data: dto,
    });
  }
}