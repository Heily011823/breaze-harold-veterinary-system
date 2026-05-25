/// Autor: María Paz Puerta Acevedo
/// Version: 1.0.0
/// Rama: feature/BH-26-implementar-administracion-completa-crud-productos

import { ApiProperty } from '@nestjs/swagger';

import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateProductDto {

  @ApiProperty({
    example: 'Amoxicillin',
    description: 'Nombre del producto',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: 'El nombre debe ser un texto',
  })
  name?: string;

  @ApiProperty({
    example: 'Medicine',
    description: 'Tipo de producto',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: 'El tipo debe ser un texto',
  })
  type?: string;

  @ApiProperty({
    example: 20,
    description: 'Cantidad disponible en stock',
    required: false,
  })
  @IsOptional()
  @IsInt({
    message: 'El stock debe ser un número entero',
  })
  @Min(0, {
    message: 'El stock no puede ser negativo',
  })
  stock?: number;

  @ApiProperty({
    example: 25000,
    description: 'Precio unitario',
    required: false,
  })
  @IsOptional()
  @IsNumber({},
    {
      message: 'El precio unitario debe ser un número',
    },
  )
  @Min(0, {
    message: 'El precio unitario no puede ser negativo',
  })
  unitPrice?: number;

  @ApiProperty({
    example: '2027-12-31',
    description: 'Fecha de vencimiento',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'La fecha de vencimiento debe tener un formato válido',
    },
  )
  expirationDate?: string;

  @ApiProperty({
    example: 5,
    description: 'Stock mínimo permitido',
    required: false,
  })
  @IsOptional()
  @IsInt({
    message: 'El stock mínimo debe ser un número entero',
  })
  @Min(0, {
    message: 'El stock mínimo no puede ser negativo',
  })
  minimumStock?: number;
}