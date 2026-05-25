import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

/// Autor:  Mateo Quintero 
/// Version: 0.1
/// rama: 17-el registro de consultas


export class CreateMedicalRecordDto {
  @IsUUID()
  petId!: string;

  @IsString()
  @IsNotEmpty()
  visitReason!: string;

  @IsString()
  @IsNotEmpty()
  diagnosis!: string;

  @IsNumber()
  @Min(0)
  currentWeight!: number;
}