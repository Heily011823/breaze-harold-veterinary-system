/// Autor: ChechoGc
/// Historia: BH-1, BH-2, BH-3 - Registro, autenticación JWT y verificación de correo

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea una cuenta con estado PENDING_VERIFICATION y envía un código de 6 dígitos al correo. Los clientes quedan activos tras verificar. Recepcionistas y veterinarios también requieren aprobación del administrador.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Cuenta creada — se envió el código de verificación al correo',
  })
  @ApiResponse({ status: 409, description: 'El correo ya está registrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar correo electrónico',
    description: `Valida el código de 6 dígitos enviado al correo del usuario.

**Escenario 1 — Cliente (CLIENT):** código válido → cuenta queda ACTIVE.
**Escenario 2 — Personal (VETERINARIAN / RECEPTIONIST):** código válido → cuenta queda PENDING_APPROVAL (requiere aprobación de administrador).
**Escenario 3 — Código inválido o expirado (>15 min):** devuelve 400 y mantiene el estado previo.`,
  })
  @ApiResponse({
    status: 200,
    description:
      'Correo verificado. El estado resultante depende del rol del usuario.',
  })
  @ApiResponse({
    status: 400,
    description: 'Código inválido, expirado, o cuenta ya verificada',
  })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
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
    description:
      'Credenciales inválidas (correo no registrado o contraseña incorrecta)',
  })
  @ApiResponse({
    status: 403,
    description:
      'Cuenta inactiva, pendiente de verificación, aprobación o suspendida',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
