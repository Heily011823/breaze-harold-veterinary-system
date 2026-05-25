// Autor: Jacobo
// Version: 0.1

import { IsDateString, IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePetDto {
  @ApiProperty({ description: 'UUID del cliente propietario' })
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ example: 'Firulais' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Perro' })
  @IsString()
  @IsNotEmpty()
  species: string;

  @ApiProperty({ example: 'Golden Retriever' })
  @IsString()
  @IsNotEmpty()
  breed: string;

  @ApiProperty({ example: 'Dorado' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ example: '2020-03-15' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ example: 25.5 })
  @IsNumber()
  @Min(0)
  weight: number;
}
