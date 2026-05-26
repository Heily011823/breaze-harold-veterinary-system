import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';

/// Autor: Mateo Quintero
/// Version: 0.1
/// rama: 17-el registro de consultas

@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
})
export class MedicalRecordsModule {}