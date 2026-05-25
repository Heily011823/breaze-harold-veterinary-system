import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './modules/products/products.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ServicesModule } from './modules/services/services.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AuthModule } from './modules/auth/auth.module';


@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MedicalRecordsModule,
    ProductsModule,
    InvoicesModule,
    ReportsModule,
    EventEmitterModule.forRoot({
      wildcard: false,   // Opcional: configuración por si la necesitas
      delimiter: '.',
      maxListeners: 10,
    }),
    MedicalRecordsModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}