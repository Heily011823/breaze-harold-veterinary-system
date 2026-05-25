/// Autor: Heily011823
/// Historia: BH-35 (reportes PDF) + BH-4 (RBAC)
/// Versión: 2.0

import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { UserRole } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('invoices')
  @ApiOperation({
    summary: 'Reporte de facturación por período en PDF',
    description: 'Solo ADMIN. Genera PDF con facturas del rango de fechas.',
  })
  @ApiProduces('application/pdf')
  @ApiQuery({ name: 'startDate', required: false, example: '2026-05-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-05-31' })
  @ApiResponse({ status: 200, description: 'PDF generado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso — solo ADMIN' })
  async getInvoicesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportsService.generateInvoicesReport(
      startDate,
      endDate,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporte-facturacion.pdf"',
    });

    res.send(pdfBuffer);
  }

  @Get('inventory')
  @ApiOperation({
    summary: 'Reporte de inventario actual en PDF',
    description: 'Solo ADMIN.',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso — solo ADMIN' })
  async getInventoryReport(@Res() res: Response) {
    const pdfBuffer = await this.reportsService.generateInventoryReport();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporte-inventario.pdf"',
    });

    res.send(pdfBuffer);
  }

  @Get('appointments')
  @ApiOperation({
    summary: 'Reporte de citas por período en PDF',
    description: 'Solo ADMIN.',
  })
  @ApiProduces('application/pdf')
  @ApiQuery({ name: 'startDate', required: false, example: '2026-05-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-05-31' })
  @ApiResponse({ status: 200, description: 'PDF generado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso — solo ADMIN' })
  async getAppointmentsReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportsService.generateAppointmentsReport(
      startDate,
      endDate,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporte-citas.pdf"',
    });

    res.send(pdfBuffer);
  }

  @Get('audit')
  @ApiOperation({
    summary: 'Reporte de auditoría por período en PDF',
    description: 'Solo ADMIN.',
  })
  @ApiProduces('application/pdf')
  @ApiQuery({ name: 'startDate', required: false, example: '2026-05-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-05-31' })
  @ApiResponse({ status: 200, description: 'PDF generado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso — solo ADMIN' })
  async getAuditReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportsService.generateAuditReport(
      startDate,
      endDate,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporte-auditoria.pdf"',
    });

    res.send(pdfBuffer);
  }
}
