/// Autor: María Paz Puerta Acevedo
/// Version: 1.0.0
/// Branch: feature/BH-29-configurar-catalogo-servicios-veterinarios-control-vigencia

import { Module } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';

import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [HttpModule],

  controllers: [ServicesController],

  providers: [
    ServicesService,
    PrismaService,
  ],

  exports: [ServicesService],
})

export class ServicesModule {}