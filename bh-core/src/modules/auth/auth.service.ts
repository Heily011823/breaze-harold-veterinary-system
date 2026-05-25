/// Autor: ChechoGc
/// Historia: BH-1, BH-2, BH-3 - Registro, autenticación JWT y verificación de correo

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { AccountStatus, UserRole } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailService } from './email/email.service';

const BCRYPT_SALT_ROUNDS = 10;
const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000; // 15 minutos

const ACCOUNT_STATUS_MESSAGES: Record<AccountStatus, string> = {
  PENDING_VERIFICATION:
    'Tu cuenta aún no ha sido verificada. Revisa tu correo electrónico.',
  PENDING_APPROVAL:
    'Tu cuenta está pendiente de aprobación por parte de un administrador.',
  ACTIVE: 'Cuenta activa.',
  SUSPENDED: 'Tu cuenta ha sido suspendida. Contacta al administrador.',
};

type AuditActionType =
  | 'USER_REGISTERED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'EMAIL_VERIFIED';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe una cuenta registrada con este correo electrónico',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const verificationCodeExpiresAt = new Date(
      Date.now() + VERIFICATION_CODE_TTL_MS,
    );

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: dto.role,
        verificationCode,
        verificationCodeExpiresAt,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    await this.notifyAudit({
      actionType: 'USER_REGISTERED',
      userId: user.id,
      userFullName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      description: `Nueva cuenta registrada para ${user.firstName} ${user.lastName} con rol ${user.role}`,
    });

    // Fire-and-forget: el fallo del correo no interrumpe el registro
    void this.emailService.sendVerificationCode(
      user.email,
      user.firstName,
      verificationCode,
    );

    return {
      message:
        'Cuenta creada exitosamente. Hemos enviado un código de verificación a tu correo electrónico.',
      user,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException(
        'Código de verificación inválido o expirado',
      );
    }

    if (user.status !== AccountStatus.PENDING_VERIFICATION) {
      throw new BadRequestException(
        'Tu cuenta ya fue verificada o no requiere verificación en este momento',
      );
    }

    // Escenario 3: código incorrecto o expirado
    const codeExpired =
      !user.verificationCodeExpiresAt ||
      user.verificationCodeExpiresAt < new Date();
    const codeInvalid = user.verificationCode !== dto.code;

    if (codeInvalid || codeExpired) {
      throw new BadRequestException(
        'Código de verificación inválido o expirado',
      );
    }

    // Escenario 1 (CLIENT) → ACTIVE | Escenario 2 (STAFF) → PENDING_APPROVAL
    const newStatus =
      user.role === UserRole.CLIENT
        ? AccountStatus.ACTIVE
        : AccountStatus.PENDING_APPROVAL;

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        status: newStatus,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    await this.notifyAudit({
      actionType: 'EMAIL_VERIFIED',
      userId: user.id,
      userFullName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      description: `Correo verificado para ${user.firstName} ${user.lastName} (${user.email})`,
    });

    const message =
      newStatus === AccountStatus.ACTIVE
        ? 'Correo verificado exitosamente. Tu cuenta está activa. Ya puedes iniciar sesión.'
        : 'Correo verificado exitosamente. Tu cuenta está pendiente de aprobación por un administrador.';

    return { message, status: newStatus };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Escenario 2a: correo no registrado — mensaje genérico para evitar enumeración de emails
    if (!user) {
      await this.notifyAudit({
        actionType: 'LOGIN_FAILED',
        userId: 'anonymous',
        userFullName: dto.email,
        userRole: UserRole.CLIENT,
        description: `Intento de inicio de sesión fallido: correo no registrado (${dto.email})`,
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Escenario 2b: contraseña incorrecta
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      await this.notifyAudit({
        actionType: 'LOGIN_FAILED',
        userId: user.id,
        userFullName: `${user.firstName} ${user.lastName}`,
        userRole: user.role,
        description: `Intento de inicio de sesión fallido: contraseña incorrecta para ${user.email}`,
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Escenario 3: cuenta no activa (credenciales correctas pero acceso bloqueado)
    if (user.status !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(
        ACCOUNT_STATUS_MESSAGES[user.status] ?? 'Tu cuenta no está activa.',
      );
    }

    // Escenario 1: credenciales válidas y cuenta activa
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    await this.notifyAudit({
      actionType: 'LOGIN_SUCCESS',
      userId: user.id,
      userFullName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      description: `Inicio de sesión exitoso para ${user.firstName} ${user.lastName}`,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }

  private async notifyAudit(params: {
    actionType: AuditActionType;
    userId: string;
    userFullName: string;
    userRole: UserRole;
    description: string;
  }): Promise<void> {
    const auditUrl = process.env.BH_AUDIT_URL ?? 'http://localhost:3001';

    try {
      await firstValueFrom(
        this.httpService.post(`${auditUrl}/api/v1/audit/events`, params),
      );
    } catch {
      console.error(
        `[audit] No se pudo notificar el evento ${params.actionType}`,
      );
    }
  }
}
