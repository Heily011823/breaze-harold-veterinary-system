/// Autor: María Paz Puerta Acevedo
/// Version: 1.0.0
/// Rama: feature/BH-26-implementar-administracion-completa-crud-productos

import { ApiProperty } from '@nestjs/swagger';

import {IsDateString, IsInt, IsNotEmpty, IsNumber, IsString, Min,} from 'class-validator';

export class CreateProductDto {

  @ApiProperty({example: 'Amoxicillin', description: 'Product name',})
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({example: 'Medicine', description: 'Product type',})
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({example: 15, description: 'Available stock quantity',})
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({example: 25000, description: 'Unit price of the product',})
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiProperty({example: '2027-12-31', description: 'Product expiration date',})
  @IsDateString()
  expirationDate!: string;

  @ApiProperty({example: 5, description: 'Minimum stock allowed',})
  @IsInt()
  @Min(0)
  minimumStock!: number;
}