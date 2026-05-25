import { ApiProperty } from '@nestjs/swagger';

import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateServiceDto {

  @ApiProperty({
    example: 'Consulta General',
    description: 'Nombre del servicio',
    required: false,
  })
  @IsOptional()
  @IsString({
    message:
      'El nombre debe ser texto',
  })
  name?: string;

  @ApiProperty({
    example:
      'Consulta médica veterinaria general',

    description:
      'Descripción del servicio',

    required: false,
  })
  @IsOptional()
  @IsString({
    message:
      'La descripción debe ser texto',
  })
  description?: string;

  @ApiProperty({
    example: 90000,
    description:
      'Precio actualizado',

    required: false,
  })
  @IsOptional()
  @IsNumber(
    {},
    {
      message:
        'El precio debe ser numérico',
    },
  )
  @Min(0, {
    message:
      'El precio no puede ser negativo',
  })
  price?: number;
}