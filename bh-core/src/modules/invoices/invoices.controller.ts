/// Autor: Heily011823
/// Historia: BH-34 (facturas PDF) + BH-4 (RBAC)
/// Versión: 2.0

import { Body, Controller, Get, Param, Patch, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { UserRole } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CancelInvoiceDto } from './dto/cancel-invoice.dto';

@ApiTags('Invoices')
@ApiBearerAuth('access-token')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Crear factura',
    description: 'RECEPTIONIST y ADMIN.',
  })
  @ApiResponse({ status: 201, description: 'Factura creada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Listar todas las facturas',
    description: 'RECEPTIONIST y ADMIN.',
  })
  @ApiResponse({ status: 200, description: 'Lista de facturas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN, UserRole.CLIENT)
  @ApiOperation({
    summary: 'Obtener factura por ID',
    description: 'RECEPTIONIST, ADMIN y CLIENT (consulta su propia factura).',
  })
  @ApiResponse({ status: 200, description: 'Factura encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Get(':id/pdf')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN, UserRole.CLIENT)
  @ApiOperation({
    summary: 'Descargar factura en PDF',
    description: 'RECEPTIONIST, ADMIN y CLIENT.',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  async downloadInvoicePdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.invoicesService.generateInvoicePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="factura-${id}.pdf"`,
    });

    res.send(pdfBuffer);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @ApiBody({ type: CancelInvoiceDto })
  @ApiOperation({
    summary: 'Cancelar factura',
    description: 'RECEPTIONIST y ADMIN.',
  })
  @ApiResponse({ status: 200, description: 'Factura cancelada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  cancel(@Param('id') id: string, @Body() cancelInvoiceDto: CancelInvoiceDto) {
    return this.invoicesService.cancel(id, cancelInvoiceDto.reason);
  }
}
