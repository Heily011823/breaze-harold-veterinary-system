/// Autor: Heily011823
/// Versión: 0.1
/// Rama: feature/BH-34-desarrollar-motor-exportacion-facturas-pdf
/// Descripción: Servicio encargado de gestionar facturas, anulación justificada y exportación individual de facturas en PDF.

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import PDFDocument = require('pdfkit');
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    const { items, paidAmount = 0, discount = 0 } = createInvoiceDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('La factura debe tener al menos un ítem.');
    }

    if (discount < 0) {
      throw new BadRequestException('El descuento no puede ser negativo.');
    }

    if (paidAmount < 0) {
      throw new BadRequestException('El valor pagado no puede ser negativo.');
    }

    const itemsWithTotals = items.map((item) => {
      const quantity = item.quantity || 1;

      if (quantity <= 0) {
        throw new BadRequestException(
          'La cantidad del ítem debe ser mayor que cero.',
        );
      }

      if (item.unitPrice < 0) {
        throw new BadRequestException('El precio unitario no puede ser negativo.');
      }

      const total = quantity * item.unitPrice;

      return {
        description: item.description,
        type: item.type,
        quantity,
        unitPrice: item.unitPrice,
        total,
      };
    });

    const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal - discount;
    const balance = total - paidAmount;

    if (total < 0) {
      throw new BadRequestException('El total no puede ser menor que cero.');
    }

    if (balance < 0) {
      throw new BadRequestException(
        'El valor pagado no puede superar el total de la factura.',
      );
    }

    return this.prisma.invoice.create({
      data: {
        appointmentId: createInvoiceDto.appointmentId,
        clientId: createInvoiceDto.clientId,
        petId: createInvoiceDto.petId,
        subtotal,
        discount,
        paidAmount,
        total,
        balance,
        status: balance === 0 ? InvoiceStatus.PAID : InvoiceStatus.PENDING,
        items: {
          create: itemsWithTotals,
        },
      },
      include: {
        items: true,
      },
    });
  }

  async findAll() {
    return this.prisma.invoice.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada.');
    }

    return invoice;
  }

  async generateInvoicePdf(id: string): Promise<Buffer> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada.');
    }

    return this.createPdf((doc) => {
      doc.fontSize(18).text('Breaze & Harold Veterinary System', {
        align: 'center',
      });

      doc.fontSize(14).text('Factura de atención veterinaria', {
        align: 'center',
      });

      doc.moveDown();

      doc.fontSize(10).text(`Fecha de generación: ${new Date().toLocaleString()}`);
      doc.fontSize(10).text(`ID de factura: ${invoice.id}`);
      doc.fontSize(10).text(`Fecha de factura: ${invoice.createdAt.toLocaleString()}`);
      doc.moveDown();

      doc.fontSize(12).text('Información general');
      doc.fontSize(10).text(`Cliente: ${invoice.clientId || 'No registrado'}`);
      doc.fontSize(10).text(`Mascota: ${invoice.petId || 'No registrada'}`);
      doc.fontSize(10).text(`Cita: ${invoice.appointmentId || 'No registrada'}`);
      doc.fontSize(10).text(`Estado: ${invoice.status}`);
      doc.moveDown();

      doc.fontSize(12).text('Detalle de la factura');
      doc.moveDown(0.5);

      invoice.items.forEach((item, index) => {
        doc.fontSize(10).text(`${index + 1}. ${item.description}`);
        doc.fontSize(9).text(`Tipo: ${item.type}`);
        doc.fontSize(9).text(`Cantidad: ${item.quantity}`);
        doc.fontSize(9).text(`Precio unitario: ${this.formatCurrency(item.unitPrice)}`);
        doc.fontSize(9).text(`Total ítem: ${this.formatCurrency(item.total)}`);
        doc.moveDown(0.5);
      });

      doc.moveDown();

      doc.fontSize(12).text('Resumen de pago');
      doc.fontSize(10).text(`Subtotal: ${this.formatCurrency(invoice.subtotal)}`);
      doc.fontSize(10).text(`Descuento: ${this.formatCurrency(invoice.discount)}`);
      doc.fontSize(10).text(`Valor pagado: ${this.formatCurrency(invoice.paidAmount)}`);
      doc.fontSize(10).text(`Total: ${this.formatCurrency(invoice.total)}`);
      doc.fontSize(10).text(`Saldo: ${this.formatCurrency(invoice.balance)}`);
      doc.moveDown();

      if (invoice.status === InvoiceStatus.CANCELLED) {
        doc.fontSize(12).text('Información de anulación');
        doc
          .fontSize(10)
          .text(
            `Motivo de anulación: ${
              invoice.cancellationReason || 'No registrado'
            }`,
          );
        doc
          .fontSize(10)
          .text(
            `Fecha de anulación: ${
              invoice.cancelledAt
                ? invoice.cancelledAt.toLocaleString()
                : 'No registrada'
            }`,
          );
        doc.moveDown();
      }

      doc
        .fontSize(9)
        .text(
          'Este documento es un comprobante generado automáticamente por el sistema B&H.',
          {
            align: 'center',
          },
        );
    });
  }

  async cancel(id: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException(
        'El motivo de anulación de la factura es obligatorio.',
      );
    }

    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada.');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('La factura ya se encuentra anulada.');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.CANCELLED,
        cancellationReason: reason.trim(),
        cancelledAt: new Date(),
      },
      include: {
        items: true,
      },
    });
  }

  private formatCurrency(value: number): string {
    return `$${value.toLocaleString('es-CO')}`;
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