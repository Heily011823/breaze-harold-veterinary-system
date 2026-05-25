/// Autor: milerickhenaor-alt
/// Version: 0.1
/// Rama: BH-22-desarrollar-proceso-internacion-medica-mascotas
/// Rama: BH-23-implementar-registro-alta-egreso-clinico-paciente

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHospitalizationDto } from './dto/create-hospitalization.dto';
import { DischargeHospitalizationDto } from './dto/discharge-hospitalization.dto';

@Injectable()
export class HospitalizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateHospitalizationDto) {
    const existing = await this.prisma.hospitalization.findFirst({
      where: {
        petId: dto.petId,
        status: 'HOSPITALIZED',
      },
    });

    if (existing) {
      throw new BadRequestException('This pet is already hospitalized');
    }

    return this.prisma.hospitalization.create({
      data: {
        petId: dto.petId,
        veterinarianId: dto.veterinarianId,
        reason: dto.reason,
        notes: dto.notes,
      },
    });
  }

  async discharge(id: string, dto: DischargeHospitalizationDto) {
    const hospitalization = await this.prisma.hospitalization.findUnique({
      where: { id },
    });

    if (!hospitalization) {
      throw new NotFoundException(`Hospitalization ${id} not found`);
    }

    if (hospitalization.status === 'DISCHARGED') {
      throw new BadRequestException('This hospitalization is already discharged');
    }

    return this.prisma.hospitalization.update({
      where: { id },
      data: {
        status: 'DISCHARGED',
        exitCondition: dto.exitCondition,
        dischargeDate: new Date(),
      },
    });
  }

develop
  async findOne(id: string) {
    const hospitalization = await this.prisma.hospitalization.findUnique({
      where: { id },
      include: { evolutionNotes: true },
    });

    if (!hospitalization) {
      throw new NotFoundException(`Hospitalization ${id} not found`);
    }

    return hospitalization;
  }

  async findByPet(petId: string) {
    return this.prisma.hospitalization.findMany({
      where: { petId },
      include: { evolutionNotes: true },
      orderBy: { admissionDate: 'desc' },
    });
  }
}