/// Autor: María Paz Puerta Acevedo
/// Version: 1.0.0
/// Rama: feature/BH-26-implementar-administracion-completa-crud-productos

import { ApiProperty } from '@nestjs/swagger';

import {IsInt, IsNotEmpty, IsString,} from 'class-validator';

export class UpdateStockDto {

  @ApiProperty({example: 5, description: 'Stock adjustment amount',})
  @IsInt()
  adjustment!: number;

  @ApiProperty({example: 'Manual inventory correction', description: 'Reason for stock adjustment',})
  @IsString()
  @IsNotEmpty()
  reason!: string;
}