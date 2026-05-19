import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [MedicalRecordsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
