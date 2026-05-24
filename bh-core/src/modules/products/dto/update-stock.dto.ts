/// Autor: María Paz Puerta Acevedo
/// Version: 1.0.0
/// Rama: feature/BH-26-implementar-administracion-completa-crud-productos

import { ApiProperty } from '@nestjs/swagger';

import {
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateStockDto {

  @ApiProperty({
    example: 5,
    description: 'Cantidad de ajuste del stock',
  })
  @IsInt({
    message: 'El ajuste debe ser un número entero',
  })
  adjustment!: number;

  @ApiProperty({
    example: 'Corrección manual de inventario',
    description: 'Motivo del ajuste de stock',
  })
  @IsString({
    message: 'La razón debe ser un texto',
  })
  @IsNotEmpty({
    message: 'La razón es obligatoria',
  })
  reason!: string;
}