import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';

@Module({
  imports: [MedicalRecordsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
