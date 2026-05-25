/// Autor: ChechoGc
/// Historia: BH-5 - Aprobación manual de cuentas de personal

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectUserDto {
  @ApiProperty({
    required: false,
    example: 'No cumple los requisitos de titulación',
    description: 'Motivo del rechazo (opcional)',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
