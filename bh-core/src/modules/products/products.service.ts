/// Autor: María Paz Puerta Acevedo
/// Version: 1.0.0
/// Rama: feature/BH-26-implementar-administracion-completa-crud-productos

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class ProductsService {

  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async create(dto: CreateProductDto) {

    return this.prisma.product.create({
      data: {
        ...dto,

        expirationDate: new Date(
          dto.expirationDate,
        ),
      },
    });
  }

  async findAll() {

    return this.prisma.product.findMany({
      where: {
        isActive: true,
      },
    });
  }

  async findOne(id: string) {

    const product =
      await this.prisma.product.findFirst({
        where: {
          id,
          isActive: true,
        },
      });

    if (!product) {

      throw new NotFoundException(
        'Producto no encontrado',
      );
    }

    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ) {

    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },

      data: {
        ...dto,

        expirationDate:
          dto.expirationDate
            ? new Date(dto.expirationDate)
            : undefined,
      },
    });
  }

  async adjustStock(
    id: string,
    dto: UpdateStockDto,
  ) {

    const product =
      await this.prisma.product.findUnique({
        where: { id },
      });

    if (!product) {

      throw new NotFoundException(
        'Producto no encontrado',
      );
    }

    const newStock =
      product.stock + dto.adjustment;

    if (newStock < 0) {

      throw new BadRequestException(
        'El stock no puede quedar negativo',
      );
    }

    const updatedProduct =
      await this.prisma.product.update({

        where: { id },

        data: {
          stock: newStock,
        },
      });

    try {

  await firstValueFrom(
    this.httpService.post(
      'http://localhost:3001/api/v1/audit/events',
      {
        actionType: 'INVENTORY_ADJUSTED',

        userId: '1',

        userFullName: 'Maria Paz',

        userRole: 'ADMIN',

        description:
          'Ajuste manual de inventario',

        metadata: {
          productId: id,

          adjustment:
            dto.adjustment,

          reason: dto.reason,
        },
      },
    ),
  );

  } catch (error) {

  if (error instanceof Error) {

    console.error(
      'No se pudo notificar al microservicio bh-audit',
      error.message,
    );

  } else {

    console.error(
      'No se pudo notificar al microservicio bh-audit',
    );
  }
}

    return updatedProduct;
  }

  async remove(id: string) {

    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },

      data: {
        isActive: false,
      },
    });
  }

  async findLowStock() {

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
      },
    });

    return products.filter((product) => product.stock <= product.minimumStock,);
  }

  async findExpiringSoon() {

    const nextMonth = new Date();

    nextMonth.setMonth(nextMonth.getMonth() + 1,);

    return this.prisma.product.findMany({
      where: {
        isActive: true,

        expirationDate: {
          lte: nextMonth,
        },
      },

      orderBy: {
        expirationDate: 'asc',
      },
    });
  }
}