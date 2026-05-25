import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientsModule } from './modules/clients/clients.module';
import { PetsModule } from './modules/pets/pets.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { HospitalizationsModule } from './modules/hospitalizations/hospitalizations.module';
import { ProductsModule } from './modules/products/products.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ServicesModule } from './modules/services/services.module';
<<<<<<< HEAD
import { AuthModule } from './modules/auth/auth.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
=======
>>>>>>> develop

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ClientsModule,
    PetsModule,
    MedicalRecordsModule,
    HospitalizationsModule,
    ProductsModule,
    InvoicesModule,
    ReportsModule,
    ServicesModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
