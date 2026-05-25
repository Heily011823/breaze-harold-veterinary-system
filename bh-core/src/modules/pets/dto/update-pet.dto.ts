// Autor: Jacobo
// Version: 0.1

import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePetDto {
  @ApiProperty({ example: 'Firulais' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Golden Retriever' })
  @IsString()
  @IsNotEmpty()
  breed: string;

  @ApiProperty({ example: 'Dorado' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ example: 25.5 })
  @IsNumber()
  @Min(0)
  weight: number;
}
