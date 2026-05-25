// prescriptions/prescriptions.service.ts

/// Autor: Mateo Quintero
/// Version: 0.1
/// Rama: Bh-19

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

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
    // Verificar que el MedicalRecord existe
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id: medicalRecordId },
    });
    if (!medicalRecord) {
      throw new NotFoundException(`MedicalRecord con ID ${medicalRecordId} no encontrado`);
    }

    // Ejecutar transacción
    return this.prisma.$transaction(async (prismaTx) => {
      const createdPrescriptions = [];

      for (const prescription of prescriptions) {
        let product = null;
        let isExternal = false;

        // Caso 1: Se envió productId -> buscar producto en inventario
        if (prescription.productId) {
          product = await prismaTx.product.findUnique({
            where: { id: prescription.productId },
          });
          if (!product) {
            throw new BadRequestException(`Producto con ID ${prescription.productId} no encontrado en inventario`);
          }
          // Verificar stock suficiente
          if (product.stock < prescription.quantityPrescribed) {
            throw new BadRequestException(
              `Stock insuficiente para el producto ${product.name}. Disponible: ${product.stock}, solicitado: ${prescription.quantityPrescribed}`,
            );
          }
          // Descontar stock
          await prismaTx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: prescription.quantityPrescribed } },
          });
          isExternal = false;
        } else {
          // Caso 2: Sin productId -> medicamento externo (solo texto)
          isExternal = true;
        }

        // Guardar la prescripción (siempre se guarda)
        const created = await prismaTx.medicationPrescription.create({
          data: {
            medicalRecordId,
            productId: product?.id || null,
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