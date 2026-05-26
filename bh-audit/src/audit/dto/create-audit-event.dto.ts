import { IsEnum, IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ActionType, UserRole } from '../entities/audit-event.entity';

export class CreateAuditEventDto {
  @IsEnum(ActionType, {
    message: 'actionType debe ser un tipo de acción válido',
  })
  @IsNotEmpty()
  actionType: ActionType;

  @IsString()
  @IsNotEmpty({ message: 'userId no puede estar vacío' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'userFullName no puede estar vacío' })
  userFullName: string;

  @IsEnum(UserRole, {
    message: 'userRole debe ser un rol válido: ADMIN, RECEPTIONIST, VETERINARIAN, CLIENT',
  })
  @IsNotEmpty()
  userRole: UserRole;

  @IsString()
  @IsNotEmpty({ message: 'description no puede estar vacía' })
  description: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}