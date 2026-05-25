// src/modules/medical-records/dto/create-medical-record.dto.ts
/// Autor:  Mateo Quintero
/// Version: 0.1
/// rama: Bh-17

/**
 * DTO (Data Transfer Object) para la creación de un registro médico.
 * Define la estructura y validaciones de los datos que debe enviar el cliente
 * al endpoint POST /medical-records.
 * 
 * Las validaciones automáticas (class-validator) devuelven 400 Bad Request
 * si algún campo requerido falta o no cumple el formato esperado.
 * 
 * NOTA: El campo 'weight' del DTO se mapea internamente a 'currentWeight'
 * en el modelo MedicalRecord de la base de datos.
 */

import { IsString, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalRecordDto {
  @ApiProperty({
    description: 'Identificador UUID de la mascota (debe existir en la tabla Pet)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  })
  @IsUUID('all', { message: 'petId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'petId es requerido' })
  petId!: string;

  @ApiProperty({
    description: 'Motivo de la visita o consulta (descripción textual)',
    example: 'Tos persistente y pérdida de apetito'
  })
  @IsString({ message: 'visitReason debe ser texto' })
  @IsNotEmpty({ message: 'El motivo de la visita es obligatorio' })
  visitReason!: string;

  @ApiProperty({
    description: 'Diagnóstico emitido por el veterinario tras la consulta',
    example: 'Infección respiratoria aguda - Bronquitis'
  })
  @IsString({ message: 'diagnosis debe ser texto' })
  @IsNotEmpty({ message: 'El diagnóstico es obligatorio' })
  diagnosis!: string;

  @ApiProperty({
    description: 'Peso actual de la mascota en kilogramos (se almacenará como currentWeight en la BD)',
    example: 12.5,
    minimum: 0.1
  })
  @IsNumber({}, { message: 'weight debe ser un número' })
  @Min(0.1, { message: 'El peso mínimo es 0.1 kg' })
  @IsNotEmpty({ message: 'El peso es obligatorio' })
  weight!: number;
}