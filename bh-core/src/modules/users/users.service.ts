/// Autor: ChechoGc
/// Historia: BH-5 - Aprobación manual de cuentas de personal

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AccountStatus, UserRole } from '@prisma/client';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from '../../prisma/prisma.service';

type AuditActionType = 'ACCOUNT_APPROVED' | 'ACCOUNT_REJECTED';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async findPendingApprovals() {
    return this.prisma.user.findMany({
      where: {
        status: AccountStatus.PENDING_APPROVAL,
        role: { in: [UserRole.VETERINARIAN, UserRole.RECEPTIONIST] },
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
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveAccount(id: string) {
    const user = await this.findUserPendingApproval(id);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: AccountStatus.ACTIVE },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    await this.notifyAudit({
      actionType: 'ACCOUNT_APPROVED',
      userId: user.id,
      userFullName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      description: `Cuenta de ${user.firstName} ${user.lastName} (${user.role}) aprobada por el administrador`,
    });

    return {
      message: `Cuenta de ${updated.firstName} ${updated.lastName} activada correctamente`,
      user: updated,
    };
  }

  async rejectAccount(id: string, reason?: string) {
    const user = await this.findUserPendingApproval(id);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: AccountStatus.SUSPENDED },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    await this.notifyAudit({
      actionType: 'ACCOUNT_REJECTED',
      userId: user.id,
      userFullName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      description: `Cuenta de ${user.firstName} ${user.lastName} (${user.role}) rechazada${reason ? `: ${reason}` : ''}`,
    });

    return {
      message: `Solicitud de ${updated.firstName} ${updated.lastName} rechazada`,
      user: updated,
    };
  }

  private async findUserPendingApproval(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.status !== AccountStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        `El usuario no está en estado PENDING_APPROVAL (estado actual: ${user.status})`,
      );
    }

    return user;
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
