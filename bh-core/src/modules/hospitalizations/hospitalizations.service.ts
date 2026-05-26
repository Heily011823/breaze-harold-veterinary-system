/// Autor: milerickhenaor-alt
/// Version: 0.1
/// Rama: BH-24-desarrollar-registro-mandatorio-notas-evolucion-diaria

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHospitalizationDto } from './dto/create-hospitalization.dto';
import { DischargeHospitalizationDto } from './dto/discharge-hospitalization.dto';
import { CreateEvolutionNoteDto } from './dto/create-evolution-note.dto';

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

  async createEvolutionNote(id: string, dto: CreateEvolutionNoteDto) {
    const hospitalization = await this.prisma.hospitalization.findUnique({
      where: { id },
    });

    if (!hospitalization) {
      throw new NotFoundException(`Hospitalization ${id} not found`);
    }

    if (hospitalization.status === 'DISCHARGED') {
      throw new BadRequestException(
        'Cannot add evolution notes to a discharged hospitalization',
      );
    }

    return this.prisma.evolutionNote.create({
      data: {
        hospitalizationId: id,
        veterinarianId: dto.veterinarianId,
        clinicalObservation: dto.clinicalObservation,
        treatment: dto.treatment,
        medications: dto.medications,
        temperature: dto.temperature,
        heartRate: dto.heartRate,
        respiratoryRate: dto.respiratoryRate,
        weight: dto.weight,
      },
    });
  }

  async getEvolutionNotes(id: string) {
    const hospitalization = await this.prisma.hospitalization.findUnique({
      where: { id },
    });

    if (!hospitalization) {
      throw new NotFoundException(`Hospitalization ${id} not found`);
    }

    return this.prisma.evolutionNote.findMany({
      where: { hospitalizationId: id },
      orderBy: { date: 'asc' },
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