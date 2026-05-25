/// Autor: ChechoGc
/// Historia: BH-5 - Aprobación manual de cuentas de personal

import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { RejectUserDto } from './dto/reject-user.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('pending-approvals')
  @ApiOperation({
    summary: 'Listar cuentas pendientes de aprobación',
    description:
      'Solo ADMIN. Retorna veterinarios y recepcionistas en estado PENDING_APPROVAL.',
  })
  @ApiResponse({ status: 200, description: 'Lista de cuentas pendientes' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso — solo ADMIN' })
  findPendingApprovals() {
    return this.usersService.findPendingApprovals();
  }

  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Aprobar cuenta de personal',
    description:
      'Solo ADMIN. Activa la cuenta de un VETERINARIAN o RECEPTIONIST en PENDING_APPROVAL.',
  })
  @ApiResponse({ status: 200, description: 'Cuenta aprobada y activada' })
  @ApiResponse({
    status: 400,
    description: 'El usuario no está en estado PENDING_APPROVAL',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso — solo ADMIN' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  approveAccount(@Param('id') id: string) {
    return this.usersService.approveAccount(id);
  }

  @Patch(':id/reject')
  @ApiBody({ type: RejectUserDto })
  @ApiOperation({
    summary: 'Rechazar solicitud de cuenta de personal',
    description:
      'Solo ADMIN. Marca la cuenta como rechazada (SUSPENDED) y registra el evento en auditoría.',
  })
  @ApiResponse({ status: 200, description: 'Solicitud rechazada' })
  @ApiResponse({
    status: 400,
    description: 'El usuario no está en estado PENDING_APPROVAL',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso — solo ADMIN' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  rejectAccount(@Param('id') id: string, @Body() dto: RejectUserDto) {
    return this.usersService.rejectAccount(id, dto.reason);
  }
}
