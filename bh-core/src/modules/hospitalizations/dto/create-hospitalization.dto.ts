/// Autor: milerickhenaor-alt
/// Version: 0.1
/// Rama: BH-22-desarrollar-proceso-internacion-medica-mascotas

import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateHospitalizationDto {
  @IsUUID()
  @IsNotEmpty()
  petId!: string;

  @IsUUID()
  @IsNotEmpty()
  veterinarianId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}