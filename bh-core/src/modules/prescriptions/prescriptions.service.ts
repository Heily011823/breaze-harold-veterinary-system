// prescriptions/prescriptions.service.ts

/// Autor: Mateo Quintero
/// Version: 0.1
/// Rama: Bh-19

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { MedicationPrescription } from '@prisma/client';
@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra una o varias prescripciones asociadas a un historial médico.
   * - Si productId existe y el producto tiene stock suficiente, descuenta la cantidad.
   * - Si productId no existe (externo), solo guarda la nota médica sin afectar inventario.
   * Todo se ejecuta dentro de una transacción.
   */
  async create(medicalRecordId: string, prescriptions: CreatePrescriptionDto[]) {
  const medicalRecord = await this.prisma.medicalRecord.findUnique({
    where: { id: medicalRecordId },
  });
  if (!medicalRecord) {
    throw new NotFoundException(`MedicalRecord con ID ${medicalRecordId} no encontrado`);
  }

  return this.prisma.$transaction(async (prismaTx) => {
    const createdPrescriptions: MedicationPrescription[] = [];

    for (const prescription of prescriptions) {
      let productIdToLink: string | null = null; // Guardaremos solo el ID si es interno
      let isExternal = false;

      if (prescription.productId) {
        // Buscar el producto en inventario
        const foundProduct = await prismaTx.product.findUnique({
          where: { id: prescription.productId },
        });
        if (!foundProduct) {
          throw new BadRequestException(`Producto con ID ${prescription.productId} no encontrado en inventario`);
        }
        if (foundProduct.stock < prescription.quantityPrescribed) {
          throw new BadRequestException(
            `Stock insuficiente para ${foundProduct.name}. Disponible: ${foundProduct.stock}, solicitado: ${prescription.quantityPrescribed}`,
          );
        }
        // Descontar stock
        await prismaTx.product.update({
          where: { id: foundProduct.id },
          data: { stock: { decrement: prescription.quantityPrescribed } },
        });
        productIdToLink = foundProduct.id;
        isExternal = false;
      } else {
        // Medicamento externo
        isExternal = true;
      }

      // Guardar prescripción
      const created = await prismaTx.medicationPrescription.create({
        data: {
          medicalRecordId,
          productId: productIdToLink, // null si es externo
          medicineName: prescription.medicineName,
          dosage: prescription.dosage,
          duration: prescription.duration,
          quantityPrescribed: prescription.quantityPrescribed,
          isExternal,
        },
      });
      createdPrescriptions.push(created);
    }

    return createdPrescriptions;
  });
}

  /**
   * Obtiene todas las prescripciones de un historial médico.
   */
  async findByMedicalRecord(medicalRecordId: string) {
    return this.prisma.medicationPrescription.findMany({
      where: { medicalRecordId },
      include: { product: { select: { id: true, name: true, stock: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }
}