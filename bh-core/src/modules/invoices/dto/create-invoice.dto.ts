/// Autor: Heily011823
/// Versión: 0.1
/// Rama: feature/BH-32-implementar-aplicacion-descuentos-porcentuales-facturacion
/// Descripción: DTO encargado de validar la información necesaria para crear una factura.
/// Incluye soporte para aplicar descuentos porcentuales sobre el subtotal de la factura.

import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @IsString()
  description!: string;

  @IsIn(['SERVICE', 'MEDICATION', 'OTHER'])
  type!: 'SERVICE' | 'MEDICATION' | 'OTHER';

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  petId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  /// Porcentaje de descuento aplicado sobre el subtotal.
  /// Ejemplo: 10 significa 10%.
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[];
}