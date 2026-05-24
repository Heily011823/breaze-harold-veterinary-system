/// Autor: Heily011823
/// Versión: 0.1
/// Rama: feature/BH-34-desarrollar-motor-exportacion-facturas-pdf
/// Descripción: Controlador encargado de gestionar facturas y permitir la descarga individual de facturas en formato PDF.

import { Body, Controller, Get, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CancelInvoiceDto } from './dto/cancel-invoice.dto';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download invoice by id in PDF format' })
  @ApiProduces('application/pdf')
  async downloadInvoicePdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.invoicesService.generateInvoicePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="factura-${id}.pdf"`,
    });

    res.send(pdfBuffer);
  }

  @Patch(':id/cancel')
  @ApiBody({ type: CancelInvoiceDto })
  cancel(@Param('id') id: string, @Body() cancelInvoiceDto: CancelInvoiceDto) {
    return this.invoicesService.cancel(id, cancelInvoiceDto.reason);
  }
}