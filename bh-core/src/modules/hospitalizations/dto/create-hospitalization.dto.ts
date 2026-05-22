import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateHospitalizationDto {
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @IsUUID()
  @IsNotEmpty()
  veterinarianId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  notes?: string;
}