import { ApiProperty } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateServiceDto {

  @ApiProperty({
    example: 'Consulta General',
    description: 'Nombre del servicio',
  })
  @IsString({
    message:
      'El nombre debe ser un texto',
  })
  @IsNotEmpty({
    message:
      'El nombre es obligatorio',
  })
  name!: string;

  @ApiProperty({
    example:
      'Consulta médica veterinaria general',

    description:
      'Descripción del servicio',
  })
  @IsString({
    message:
      'La descripción debe ser un texto',
  })
  @IsNotEmpty({
    message:
      'La descripción es obligatoria',
  })
  description!: string;

  @ApiProperty({
    example: 80000,
    description:
      'Precio del servicio',
  })
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
  price!: number;
}