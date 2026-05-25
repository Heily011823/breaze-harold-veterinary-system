// Autor: Jacobo
// Version: 0.1

import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Perez' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+57 300 123 4567' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: '1053867123' })
  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @ApiPropertyOptional({ example: 'Calle 23 # 45-67' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Manizales' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'UUID del usuario asociado si ya tiene cuenta' })
  @IsUUID()
  @IsOptional()
  userId?: string;
}
