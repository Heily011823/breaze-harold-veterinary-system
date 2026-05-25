import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { HospitalizationsModule } from './modules/hospitalizations/hospitalizations.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './modules/products/products.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    MedicalRecordsModule,
    HospitalizationsModule,
    PrismaModule,
    ProductsModule,
    InvoicesModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}