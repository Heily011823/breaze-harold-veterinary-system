// Autor: Jacobo
// Version: 0.1

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    const existing = await this.prisma.client.findFirst({
      where: {
        OR: [{ email: dto.email }, { documentNumber: dto.documentNumber }],
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe un cliente con ese correo o numero de documento',
      );
    }

    return this.prisma.client.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        documentNumber: dto.documentNumber,
        address: dto.address,
        city: dto.city,
        userId: dto.userId,
      },
    });
  }

  async findAll(page = 1, pageSize = 20, search?: string) {
    const skip = (page - 1) * pageSize;
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { documentNumber: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.client.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      this.prisma.client.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);

    const conflict = await this.prisma.client.findFirst({
      where: { email: dto.email, NOT: { id } },
    });
    if (conflict) throw new ConflictException('El correo ya esta en uso por otro cliente');

    return this.prisma.client.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        address: dto.address,
        city: dto.city,
      },
    });
  }
}
