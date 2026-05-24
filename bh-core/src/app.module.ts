import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './modules/products/products.module';
import { InvoicesModule } from './modules/invoices/invoices.module';

@Module({
  imports: [MedicalRecordsModule, PrismaModule, ProductsModule, InvoicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

