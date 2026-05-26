/// Autor: Heily011823
/// Versión: 0.1
/// Rama: feature/BH-35-implementar-generacion-reportes-masivos-pdf-administracion
/// Descripción: Módulo encargado de registrar los componentes necesarios para la generación de reportes masivos en PDF.

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}