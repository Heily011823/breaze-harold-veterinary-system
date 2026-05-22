import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { HospitalizationsModule } from './modules/hospitalizations/hospitalizations.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [MedicalRecordsModule, HospitalizationsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}