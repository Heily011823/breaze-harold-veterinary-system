import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
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
        throw new BadRequestException('La cantidad del ítem debe ser mayor que cero.');
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
}