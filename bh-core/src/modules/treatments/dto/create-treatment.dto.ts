// treatments/dto/create-treatment.dto.ts

/// Autor: Mateo Quintero
/// Version: 0.1
/// Rama: Bh-18

import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear un nuevo tratamiento asociado a un historial médico.
 * La fecha de próxima visita es opcional (cumple Escenario 2).
 */
export class CreateTreatmentDto {
  @ApiProperty({
    description: 'Descripción detallada del tratamiento aplicado',
    example: 'Limpieza dental y aplicación de antibiótico tópico',
  })
  @IsString({ message: 'La descripción debe ser texto' })
  @IsNotEmpty({ message: 'La descripción del tratamiento es obligatoria' })
  description!: string;

  @ApiProperty({
    description: 'Fecha estimada para la próxima visita de control (opcional)',
    example: '2026-06-15',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener formato ISO8601 (YYYY-MM-DD)' })
  nextVisitDate?: string;
}