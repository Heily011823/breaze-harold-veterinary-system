// vaccines/vaccines.module.ts

/// Autor: Mateo Quintero
/// Version: 0.1
/// Rama: Bh-20

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../prisma/prisma.module';
import { VaccinesController } from './vaccines.controller';
import { VaccinesService } from './vaccines.service';

@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],
  controllers: [VaccinesController],
  providers: [VaccinesService],
})
export class VaccinesModule {}