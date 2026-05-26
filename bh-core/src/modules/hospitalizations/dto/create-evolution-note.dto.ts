/// Autor: milerickhenaor-alt
/// Version: 0.1
/// Rama: BH-24-desarrollar-registro-mandatorio-notas-evolucion-diaria

import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEvolutionNoteDto {
  @IsString()
  @IsNotEmpty()
  clinicalObservation: string;

  @IsString()
  @IsNotEmpty()
  treatment: string;

  @IsString()
  @IsNotEmpty()
  medications: string;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  heartRate?: number;

  @IsNumber()
  @IsOptional()
  respiratoryRate?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsNotEmpty()
  veterinarianId: string;
}