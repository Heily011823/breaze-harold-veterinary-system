/// Autor: ChechoGc
/// Historia: BH-1, BH-2 - Registro base de usuarios y autenticación JWT

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
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
  @ApiResponse({ status: 201, description: 'Cuenta creada exitosamente' })
  @ApiResponse({ status: 409, description: 'El correo ya está registrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al usuario y retorna un token JWT firmado. Solo cuentas con estado ACTIVE pueden iniciar sesión.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso — retorna accessToken JWT',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas (correo no registrado o contraseña incorrecta)',
  })
  @ApiResponse({
    status: 403,
    description: 'Cuenta inactiva, pendiente de verificación, aprobación o suspendida',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
