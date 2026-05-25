// medical-records/dto/create-medical-record.dto.ts

/// Autor: Mateo Quintero
/// Version: 0.2
/// Rama: Bh-17

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

/**
 * DTO para registrar una nueva consulta médica.
 * No incluye veterinarianId porque se obtiene del token JWT.
 */
export class CreateMedicalRecordDto {
  @ApiProperty({
    description: 'Identificador UUID de la mascota',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID('4', { message: 'petId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'petId es requerido' })
  petId!: string;

  @ApiProperty({
    description: 'Motivo de la visita (texto libre)',
    example: 'Tos seca y pérdida de apetito',
  })
  @IsString({ message: 'visitReason debe ser texto' })
  @IsNotEmpty({ message: 'El motivo de visita es obligatorio' })
  visitReason!: string;

  @ApiProperty({
    description: 'Diagnóstico clínico',
    example: 'Infección respiratoria aguda',
  })
  @IsString({ message: 'diagnosis debe ser texto' })
  @IsNotEmpty({ message: 'El diagnóstico es obligatorio' })
  diagnosis!: string;

  @ApiProperty({
    description: 'Peso actual de la mascota en kilogramos',
    example: 5.6,
    minimum: 0,
  })
  @IsNumber({}, { message: 'currentWeight debe ser un número' })
  @Min(0, { message: 'El peso no puede ser negativo' })
  currentWeight!: number;
}