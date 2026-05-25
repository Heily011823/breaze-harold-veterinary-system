/// Autor: María Paz Puerta Acevedo
/// Version: 1.0.0
/// Branch: feature/BH-29-configurar-catalogo-servicios-veterinarios-control-vigencia

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs';

@Injectable()
export class ServicesService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async create(dto: CreateServiceDto) {

    const service =
      await this.prisma.service.create({
        data: dto,
      });

    try {

      await firstValueFrom(
        this.httpService.post(
          'http://localhost:3001/api/v1/audit/events',
          {
            actionType:
              'SERVICE_CREATED_OR_EDITED',

            userId: '1',

            userFullName: 'Maria Paz',

            userRole: 'ADMIN',

            description:
              'Creación o edición de servicio',

            metadata: {
              serviceId: service.id,
              serviceName: service.name,
            },
          },
        ),
      );

    } catch (error: unknown) {

      console.error(
        'No se pudo notificar a bh-audit',
      );
    }

    return service;
  }

  async findAll() {

    return this.prisma.service.findMany({
      where: {
        isActive: true,
      },

      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {

    const service =
      await this.prisma.service.findFirst({
        where: {
          id,
          isActive: true,
        },
      });

    if (!service) {

      throw new NotFoundException(
        'Servicio no encontrado',
      );
    }

    return service;
  }

  async update(
    id: string,
    dto: UpdateServiceDto,
  ) {

    await this.findOne(id);

    const updatedService =
      await this.prisma.service.update({
        where: {
          id,
        },

        data: dto,
      });

    try {

      await firstValueFrom(
        this.httpService.post(
          'http://localhost:3001/api/v1/audit/events',
          {
            actionType:
              'SERVICE_CREATED_OR_EDITED',

            userId: '1',

            userFullName: 'Maria Paz',

            userRole: 'ADMIN',

            description:
              'Creación o edición de servicio',

            metadata: {
              serviceId: id,
            },
          },
        ),
      );

    } catch (error: unknown) {

      console.error(
        'No se pudo notificar a bh-audit',
      );
    }

    return updatedService;
  }

  async remove(id: string) {

    await this.findOne(id);

    const removedService =
      await this.prisma.service.update({
        where: {
          id,
        },

        data: {
          isActive: false,
        },
      });

    try {

      await firstValueFrom(
        this.httpService.post(
          'http://localhost:3001/api/v1/audit/events',
          {
            actionType:
              'SERVICE_DEACTIVATED',

            userId: '1',

            userFullName: 'Maria Paz',

            userRole: 'ADMIN',

            description:
              'Desactivación de servicio',

            metadata: {
              serviceId: id,
            },
          },
        ),
      );

    } catch (error: unknown) {

      console.error(
        'No se pudo notificar a bh-audit',
      );
    }

    return removedService;
  }
}