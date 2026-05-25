/// Autor: milerickhenaor-alt
/// Version: 0.1
/// Rama: BH-22-desarrollar-proceso-internacion-medica-mascotas

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { HospitalizationsController } from './hospitalizations.controller';
import { HospitalizationsService } from './hospitalizations.service';

@Module({
  imports: [PrismaModule],
  controllers: [HospitalizationsController],
  providers: [HospitalizationsService],
})
export class HospitalizationsModule {}