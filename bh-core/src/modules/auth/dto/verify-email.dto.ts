/// Autor: ChechoGc
/// Historia: BH-3 - Verificación de correo electrónico

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'juan@example.com',
    description: 'Correo electrónico del usuario a verificar',
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Código de 6 dígitos recibido en el correo electrónico',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  code: string;
}
