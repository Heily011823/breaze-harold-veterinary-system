// vaccines/dto/create-vaccine.dto.ts

/// Autor: Mateo Quintero
/// Version: 0.1
/// Rama: Bh-20

import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, IsUUID, MinDate } from 'class-validator';

export class CreateVaccineDto {
  @ApiProperty({ description: 'ID del historial médico asociado', example: 'a8f3c1d2-...' })
  @IsUUID()
  @IsNotEmpty()
  medicalRecordId!: string;

  @ApiProperty({ description: 'Nombre de la vacuna aplicada', example: 'Rabia' })
  @IsString()
  @IsNotEmpty()
  vaccineName!: string;

  @ApiProperty({ description: 'Fecha de aplicación (ISO8601)', example: '2026-05-25' })
  @IsDateString()
  @IsNotEmpty()
  applicationDate!: string;

  @ApiProperty({ description: 'Fecha de próximo refuerzo (ISO8601)', example: '2027-05-25' })
  @IsDateString()
  @IsNotEmpty()
  nextDueDate!: string;
}