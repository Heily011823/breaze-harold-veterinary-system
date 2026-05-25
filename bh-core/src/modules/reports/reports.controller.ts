/// Autor: Heily011823
/// Versión: 0.1
/// Rama: feature/BH-35-implementar-generacion-reportes-masivos-pdf-administracion
/// Descripción: Controlador encargado de exponer los endpoints para descargar reportes masivos en PDF.
/// Reportes incluidos: facturación por período, inventario actual, citas por período e historial de acciones.

import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiProduces, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('invoices')
  @ApiOperation({ summary: 'Generate invoice report by date range in PDF' })
  @ApiProduces('application/pdf')
  @ApiQuery({ name: 'startDate', required: false, example: '2026-05-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-05-31' })
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
  @ApiOperation({ summary: 'Generate current inventory report in PDF' })
  @ApiProduces('application/pdf')
  async getInventoryReport(@Res() res: Response) {
    const pdfBuffer = await this.reportsService.generateInventoryReport();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporte-inventario.pdf"',
    });

    res.send(pdfBuffer);
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Generate appointments report by date range in PDF' })
  @ApiProduces('application/pdf')
  @ApiQuery({ name: 'startDate', required: false, example: '2026-05-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-05-31' })
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
  @ApiOperation({ summary: 'Generate audit actions report by date range in PDF' })
  @ApiProduces('application/pdf')
  @ApiQuery({ name: 'startDate', required: false, example: '2026-05-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-05-31' })
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