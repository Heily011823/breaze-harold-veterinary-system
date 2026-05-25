// prescriptions/dto/create-prescription.dto.ts

/// Autor: Mateo Quintero
/// Version: 0.1
/// Rama: Bh-19

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'ID del producto en inventario (opcional, si es externo no enviar)', required: false })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({ description: 'Nombre del medicamento (si es externo, texto libre; si tiene productId, puede ser redundante)' })
  @IsString()
  @IsNotEmpty()
  medicineName!: string;

  @ApiProperty({ description: 'Dosis (ej. "1 tableta cada 8 horas")' })
  @IsString()
  @IsNotEmpty()
  dosage!: string;

  @ApiProperty({ description: 'Duración del tratamiento (ej. "5 días")' })
  @IsString()
  @IsNotEmpty()
  duration!: string;

  @ApiProperty({ description: 'Cantidad total prescrita (unidades a descontar del stock si es producto interno)' })
  @IsInt()
  @Min(1)
  quantityPrescribed!: number;
}