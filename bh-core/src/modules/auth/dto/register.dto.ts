/// Autor: ChechoGc
/// Historia: BH-1 - Registro base de usuarios

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

const ALLOWED_ROLES = [
  UserRole.CLIENT,
  UserRole.RECEPTIONIST,
  UserRole.VETERINARIAN,
] as const;

type RegisterableRole = (typeof ALLOWED_ROLES)[number];

export class RegisterDto {
  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({ example: 'MiContraseña123', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastName: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    enum: ALLOWED_ROLES,
    description: 'Rol del usuario. ADMIN no puede registrarse por esta vía.',
    example: UserRole.CLIENT,
  })
  @IsEnum(ALLOWED_ROLES, {
    message: `El rol debe ser uno de: ${ALLOWED_ROLES.join(', ')}`,
  })
  role: RegisterableRole;
}
