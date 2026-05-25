/// Autor: ChechoGc
/// Historia: BH-1, BH-2 - Registro base de usuarios y autenticación JWT

import {
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

const BCRYPT_SALT_ROUNDS = 10;

const ACCOUNT_STATUS_MESSAGES: Record<AccountStatus, string> = {
  PENDING_VERIFICATION:
    'Tu cuenta aún no ha sido verificada. Revisa tu correo electrónico.',
  PENDING_APPROVAL:
    'Tu cuenta está pendiente de aprobación por parte de un administrador.',
  ACTIVE: 'Cuenta activa.',
  SUSPENDED: 'Tu cuenta ha sido suspendida. Contacta al administrador.',
};

type AuditActionType = 'USER_REGISTERED' | 'LOGIN_SUCCESS' | 'LOGIN_FAILED';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
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

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: dto.role,
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

    return {
      message:
        'Cuenta creada exitosamente. Por favor verifica tu correo electrónico para activarla.',
      user,
    };
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
