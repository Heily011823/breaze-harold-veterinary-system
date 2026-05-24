/// Autor: María Paz Puerta Acevedo
/// Version: 1.0.0
/// Rama: feature/BH-26-implementar-administracion-completa-crud-productos

import {Injectable, NotFoundException,} from '@nestjs/common';

import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class ProductsService {

  constructor(private prisma: PrismaService, private readonly httpService: HttpService,) {}

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...dto,
        expirationDate: new Date(dto.expirationDate),
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

    const product = await this.prisma.product.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
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

        expirationDate: dto.expirationDate
          ? new Date(dto.expirationDate)
          : undefined,
      },
    });
  }

  async adjustStock(id: string, dto: UpdateStockDto,) {

  const product = await this.prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new NotFoundException(
      'Product not found',
    );
  }

  const updatedProduct =
    await this.prisma.product.update({

      where: { id },

      data: {
        stock:
          product.stock + dto.adjustment,
      },
    });

  try {

    await firstValueFrom(
      this.httpService.post(
        'http://bh-audit:3001/audit/events',
        {
          event: 'Manual inventory adjustment',
          productId: id,
          adjustment: dto.adjustment,
          reason: dto.reason,
          timestamp: new Date(),
        },
      ),
    );

  } catch (error) {

    console.error(
      'Could not notify bh-audit microservice',
    );
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
    return this.prisma.product.findMany({
      where: {
        isActive: true,

        stock: {
          lte: this.prisma.product.fields.minimumStock,
        },
      },
    });
  }

  async findExpiringSoon() {

    const nextMonth = new Date();

    nextMonth.setMonth(
      nextMonth.getMonth() + 1,
    );

    return this.prisma.product.findMany({
      where: {
        isActive: true,

        expirationDate: {
          lte: nextMonth,
        },
      },
    });
  }
}