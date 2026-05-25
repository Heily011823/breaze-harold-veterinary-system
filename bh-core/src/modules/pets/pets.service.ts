// Autor: Jacobo
// Version: 0.1

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PetStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { ChangePetStatusDto } from './dto/change-pet-status.dto';

const VALID_TRANSITIONS: Record<PetStatus, PetStatus[]> = {
  ACTIVE: [PetStatus.HOSPITALIZED, PetStatus.DECEASED],
  HOSPITALIZED: [PetStatus.ACTIVE, PetStatus.DECEASED],
  DECEASED: [],
};

@Injectable()
export class PetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePetDto) {
    const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
    if (!client) throw new NotFoundException('Cliente no encontrado');

    return this.prisma.pet.create({
      data: {
        clientId: dto.clientId,
        name: dto.name,
        species: dto.species,
        breed: dto.breed,
        color: dto.color,
        birthDate: new Date(dto.birthDate),
        weight: dto.weight,
      },
    });
  }

  async findAll(page = 1, pageSize = 20, clientId?: string, status?: PetStatus, search?: string) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { breed: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.pet.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      this.prisma.pet.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async findOne(id: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet) throw new NotFoundException('Mascota no encontrada');
    return pet;
  }

  async update(id: string, dto: UpdatePetDto) {
    await this.findOne(id);
    return this.prisma.pet.update({
      where: { id },
      data: { name: dto.name, breed: dto.breed, color: dto.color, weight: dto.weight },
    });
  }

  async changeStatus(id: string, dto: ChangePetStatusDto) {
    const pet = await this.findOne(id);

    if (pet.status === dto.status) {
      throw new BadRequestException('La mascota ya se encuentra en ese estado');
    }

    const allowed = VALID_TRANSITIONS[pet.status as PetStatus];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        'Transicion de estado invalida: ' + pet.status + ' -> ' + dto.status,
      );
    }

    return this.prisma.pet.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
