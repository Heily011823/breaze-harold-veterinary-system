// Autor original: Mateo Quintero
// BH-11 (consulta historial): Jacobo
// Version: 0.2

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMedicalRecordDto) {
    return this.prisma.medicalRecord.create({ data: dto });
  }

  async findByPet(petId: string, page = 1, pageSize = 20) {
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
    return { data, total, page, pageSize };
  }

  async findOne(id: string) {
    const record = await this.prisma.medicalRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Registro medico no encontrado');
    return record;
  }
}
