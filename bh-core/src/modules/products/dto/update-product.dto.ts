/// Autor: María Paz Puerta Acevedo
/// Version: 1.0.0
/// Rama: feature/BH-26-implementar-administracion-completa-crud-productos

import { ApiProperty } from '@nestjs/swagger';

import {IsDateString, IsInt, IsNumber, IsOptional,IsString, Min,} from 'class-validator';

export class UpdateProductDto {

  @ApiProperty({example: 'Amoxicillin', description: 'Product name', required: false,})
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({example: 'Medicine', description: 'Product type', required: false,})
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({example: 20, description: 'Available stock quantity', required: false,})
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiProperty({example: 25000, description: 'Unit price', required: false,})
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @ApiProperty({example: '2027-12-31', description: 'Expiration date', required: false,})
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiProperty({example: 5, description: 'Minimum stock allowed', required: false,})
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumStock?: number;
}