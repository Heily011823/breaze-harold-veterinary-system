// src/modules/medical-records/medical-records.module.ts
/// Autor:  Mateo Quintero
/// Version: 0.1
/// rama: Bh-17

import { Module } from '@nestjs/common';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,      
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}