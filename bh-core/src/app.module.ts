import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

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
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { UsersModule } from './modules/users/users.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { VaccinesModule } from './modules/vaccines/vaccines.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';


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
    UsersModule,
    TreatmentsModule,
    VaccinesModule,
    PrescriptionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
