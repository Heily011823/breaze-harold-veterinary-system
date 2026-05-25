/// Autor: María Paz Puerta Acevedo
/// Version: 1.0.0
/// Branch: feature/BH-26-implementar-administracion-completa-crud-productos

import { Module } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [HttpModule],

  controllers: [ProductsController],

  providers: [ProductsService, PrismaService,],

  exports: [ProductsService],
})
export class ProductsModule {}