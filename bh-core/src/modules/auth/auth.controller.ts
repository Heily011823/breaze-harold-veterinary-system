/// Autor: ChechoGc
/// Historia: BH-1 - Registro base de usuarios

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea una cuenta con estado PENDING_VERIFICATION. Los clientes pueden acceder tras verificar su correo. Recepcionistas y veterinarios también requieren aprobación del administrador.',
  })
  @ApiResponse({
    status: 201,
    description: 'Cuenta creada exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'El correo ya está registrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
