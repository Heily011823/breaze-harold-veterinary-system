/// Autor: milerickhenaor-alt
/// Version: 0.1
/// Rama: BH-22-desarrollar-proceso-internacion-medica-mascotas

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHospitalizationDto } from './dto/create-hospitalization.dto';

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