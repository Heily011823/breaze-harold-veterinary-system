/// Autor: Heily011823
/// Versión: 0.1
/// Rama: feature/BH-35-implementar-generacion-reportes-masivos-pdf-administracion
/// Descripción: Servicio encargado de generar los reportes masivos en PDF para administración.
/// Reportes incluidos: facturación por período, inventario actual, citas por período e historial de acciones.
/// Observación: Los reportes de citas y auditoría quedan preparados para integrarse con sus módulos correspondientes.

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import PDFDocument = require('pdfkit');
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async generateInvoicesReport(startDate?: string, endDate?: string) {
    const where = this.buildDateFilter(startDate, endDate);

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.createPdf((doc) => {
      this.addHeader(doc, 'Reporte de facturación por período');

      doc.fontSize(10).text(`Fecha inicial: ${startDate || 'No especificada'}`);
      doc.fontSize(10).text(`Fecha final: ${endDate || 'No especificada'}`);
      doc.moveDown();

      const totalFacturado = invoices.reduce(
        (sum, invoice) => sum + invoice.total,
        0,
      );

      const totalDescuentos = invoices.reduce(
        (sum, invoice) => sum + invoice.discount,
        0,
      );

      doc.fontSize(12).text(`Total de facturas: ${invoices.length}`);
      doc.fontSize(12).text(`Total facturado: $${totalFacturado}`);
      doc.fontSize(12).text(`Total descuentos: $${totalDescuentos}`);
      doc.moveDown();

      invoices.forEach((invoice, index) => {
        doc
          .fontSize(11)
          .text(`${index + 1}. Factura: ${invoice.id}`, { continued: false });

        doc.fontSize(9).text(`Cliente: ${invoice.clientId || 'No registrado'}`);
        doc.fontSize(9).text(`Mascota: ${invoice.petId || 'No registrada'}`);
        doc.fontSize(9).text(`Estado: ${invoice.status}`);
        doc.fontSize(9).text(`Subtotal: $${invoice.subtotal}`);
        doc.fontSize(9).text(`Descuento: $${invoice.discount}`);
        doc.fontSize(9).text(`Total: $${invoice.total}`);
        doc.fontSize(9).text(`Saldo: $${invoice.balance}`);
        doc.fontSize(9).text(`Fecha: ${invoice.createdAt.toISOString()}`);

        if (invoice.status === 'CANCELLED') {
          doc
            .fontSize(9)
            .text(
              `Motivo de anulación: ${
                invoice.cancellationReason || 'No registrado'
              }`,
            );
        }

        doc.moveDown();
      });
    });
  }

  async generateInventoryReport() {
    const products = await this.prisma.product.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return this.createPdf((doc) => {
      this.addHeader(doc, 'Reporte de inventario actual');

      doc.fontSize(12).text(`Total de productos: ${products.length}`);
      doc.moveDown();

      products.forEach((product, index) => {
        const isLowStock = product.stock <= product.minimumStock;
        const isExpiringSoon =
          product.expirationDate >= today &&
          product.expirationDate <= thirtyDaysFromNow;

        doc.fontSize(11).text(`${index + 1}. ${product.name}`);
        doc.fontSize(9).text(`Tipo: ${product.type}`);
        doc.fontSize(9).text(`Stock disponible: ${product.stock}`);
        doc.fontSize(9).text(`Stock mínimo: ${product.minimumStock}`);
        doc.fontSize(9).text(`Precio unitario: $${product.unitPrice}`);
        doc
          .fontSize(9)
          .text(`Fecha de vencimiento: ${product.expirationDate.toISOString()}`);
        doc.fontSize(9).text(`Activo: ${product.isActive ? 'Sí' : 'No'}`);

        if (isLowStock) {
          doc.fontSize(9).text('Alerta: Producto con stock bajo');
        }

        if (isExpiringSoon) {
          doc.fontSize(9).text('Alerta: Producto próximo a vencer');
        }

        doc.moveDown();
      });
    });
  }

  async generateAppointmentsReport(startDate?: string, endDate?: string) {
    return this.createPdf((doc) => {
      this.addHeader(doc, 'Reporte de citas por período');

      doc.fontSize(10).text(`Fecha inicial: ${startDate || 'No especificada'}`);
      doc.fontSize(10).text(`Fecha final: ${endDate || 'No especificada'}`);
      doc.moveDown();

      doc
        .fontSize(11)
        .text(
          'El endpoint del reporte de citas fue creado. Actualmente no se encontraron modelos de citas en Prisma dentro de bh-core para consultar registros reales.',
        );

      doc.moveDown();

      doc
        .fontSize(10)
        .text(
          'Cuando el módulo de citas esté disponible, este reporte debe listar cliente, mascota, veterinario, fecha y estado final de la cita.',
        );
    });
  }

  async generateAuditReport(startDate?: string, endDate?: string) {
    const auditUrl = process.env.BH_AUDIT_URL;

    return this.createPdf(async (doc) => {
      this.addHeader(doc, 'Reporte de historial de acciones');

      doc.fontSize(10).text(`Fecha inicial: ${startDate || 'No especificada'}`);
      doc.fontSize(10).text(`Fecha final: ${endDate || 'No especificada'}`);
      doc.moveDown();

      if (!auditUrl) {
        doc
          .fontSize(11)
          .text(
            'El endpoint del reporte de auditoría fue creado. No se encontró la variable de entorno BH_AUDIT_URL para consultar el microservicio bh-audit.',
          );

        doc.moveDown();

        doc
          .fontSize(10)
          .text(
            'Cuando bh-audit esté configurado, este reporte debe consumir las acciones almacenadas y mostrar usuario, rol, acción ejecutada y fecha exacta.',
          );

        return;
      }

      try {
        const response = await firstValueFrom(
          this.httpService.get(`${auditUrl}/audit`, {
            params: {
              startDate,
              endDate,
            },
          }),
        );

        const actions = Array.isArray(response.data) ? response.data : [];

        doc.fontSize(12).text(`Total de acciones: ${actions.length}`);
        doc.moveDown();

        actions.forEach((action, index) => {
          doc.fontSize(11).text(`${index + 1}. ${action.action || 'Acción'}`);
          doc.fontSize(9).text(`Usuario: ${action.userName || 'No registrado'}`);
          doc.fontSize(9).text(`Rol: ${action.role || 'No registrado'}`);
          doc.fontSize(9).text(`Fecha: ${action.createdAt || 'No registrada'}`);
          doc.moveDown();
        });
      } catch {
        doc
          .fontSize(11)
          .text(
            'No fue posible consultar bh-audit en este momento. El PDF se generó dejando constancia del intento de consulta.',
          );
      }
    });
  }

  private buildDateFilter(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) {
      return {};
    }

    const createdAt: {
      gte?: Date;
      lte?: Date;
    } = {};

    if (startDate) {
      createdAt.gte = new Date(startDate);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      createdAt.lte = end;
    }

    return { createdAt };
  }

  private addHeader(doc: PDFKit.PDFDocument, title: string) {
    doc.fontSize(18).text('Breaze & Harold Veterinary System', {
      align: 'center',
    });

    doc.fontSize(14).text(title, {
      align: 'center',
    });

    doc.moveDown();
    doc.fontSize(10).text(`Generado el: ${new Date().toLocaleString()}`);
    doc.moveDown();
  }

  private async createPdf(
    contentBuilder:
      | ((doc: PDFKit.PDFDocument) => void)
      | ((doc: PDFKit.PDFDocument) => Promise<void>),
  ): Promise<Buffer> {
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk as Buffer));

    const finished = new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    await contentBuilder(doc);

    doc.end();

    return finished;
  }
}