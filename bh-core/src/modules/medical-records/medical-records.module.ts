import { Module } from '@nestjs/common';

import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';


/// Autor:  Mateo Quintero 
/// Version: 0.1
/// rama: 17-el registro de consultas

@Module({
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
})
export class MedicalRecordsModule {}