/// Autor: ChechoGc
/// Historia: BH-1 - Registro base de usuarios

import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '@prisma/client';

const BCRYPT_SALT_ROUNDS = 10;

// Clientes se activan tras verificar correo; staff también debe esperar aprobación del admin
const ROLES_REQUIRING_APPROVAL = [
  UserRole.RECEPTIONIST,
  UserRole.VETERINARIAN,
];

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
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
        // PENDING_VERIFICATION es el valor por defecto del schema
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

    await this.notifyAudit(user.id, `${user.firstName} ${user.lastName}`, user.role);

    return {
      message: 'Cuenta creada exitosamente. Por favor verifica tu correo electrónico para activarla.',
      user,
    };
  }

  private async notifyAudit(
    userId: string,
    userFullName: string,
    userRole: UserRole,
  ): Promise<void> {
    const auditUrl =
      process.env.BH_AUDIT_URL ?? 'http://localhost:3001';

    try {
      await firstValueFrom(
        this.httpService.post(`${auditUrl}/api/v1/audit/events`, {
          actionType: 'USER_REGISTERED',
          userId,
          userFullName,
          userRole,
          description: `Nueva cuenta registrada para ${userFullName} con rol ${userRole}`,
        }),
      );
    } catch {
      // El fallo de auditoría no debe bloquear el registro
      console.error('No se pudo notificar el registro al servicio bh-audit');
    }
  }
}
