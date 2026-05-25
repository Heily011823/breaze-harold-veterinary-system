/// Autor: María Paz Puerta Acevedo
/// Version: 1.0.0
/// Rama: feature/BH-26-implementar-administracion-completa-crud-productos

import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';

import { 
  IsDateString, 
  IsInt, 
  IsNotEmpty, 
  IsNumber, 
  IsString, 
  Min,
} from 'class-validator';

export class CreateProductDto {

  @ApiProperty({
    example: 'Amoxicilina',
    description: 'Nombre del producto',
  })
  @IsString({
    message: 'El nombre debe ser un texto',
  })
  @IsNotEmpty({
    message: 'El nombre es obligatorio',
  })
  name!: string;

  @ApiProperty({
    example: 'Medicamento',
    description: 'Tipo de producto',
  })
  @IsString({
    message: 'El tipo debe ser un texto',
  })
  @IsNotEmpty({
    message: 'El tipo es obligatorio',
  })
  type!: string;

  @ApiProperty({
    example: 15,
    description: 'Cantidad disponible en inventario',
  })
  @Type(() => Number)
  @IsInt({
    message: 'El stock debe ser un número entero',
  })
  @Min(0, {
    message: 'El stock no puede ser negativo',
  })
  stock!: number;

  @ApiProperty({
    example: 25000,
    description: 'Precio unitario del producto',
  })
  @Type(() => Number)
  @IsNumber(
    {},
    {
      message: 'El precio unitario debe ser un número',
    },
  )
  @Min(0, {
    message: 'El precio unitario no puede ser negativo',
  })
  unitPrice!: number;

  @ApiProperty({
    example: '2027-12-31',
    description: 'Fecha de vencimiento del producto',
  })
  @IsDateString({}, {
      message: 'La fecha de vencimiento no es válida',
    },
  )
  expirationDate!: string;

  @ApiProperty({
    example: 5,
    description: 'Stock mínimo permitido',
  })
  @Type(() => Number)
  @IsInt({
    message: 'El stock mínimo debe ser un número entero',
  })
  @Min(0, {
    message: 'El stock mínimo no puede ser negativo',
  })
  minimumStock!: number;
}