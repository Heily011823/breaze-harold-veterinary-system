// prescriptions/prescriptions.module.ts

/// Autor: Mateo Quintero
/// Version: 0.1
/// Rama: Bh-19

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';

@Module({
  imports: [PrismaModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
})
export class PrescriptionsModule {}