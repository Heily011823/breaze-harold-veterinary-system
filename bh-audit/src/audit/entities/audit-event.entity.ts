import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ActionType {
  USER_REGISTERED = 'USER_REGISTERED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  ACCOUNT_APPROVED_OR_REJECTED = 'ACCOUNT_APPROVED_OR_REJECTED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  APPOINTMENT_CREATED = 'APPOINTMENT_CREATED',
  APPOINTMENT_STATUS_CHANGED = 'APPOINTMENT_STATUS_CHANGED',
  MEDICAL_RECORD_CREATED = 'MEDICAL_RECORD_CREATED',
  MEDICAL_RECORD_EDITED = 'MEDICAL_RECORD_EDITED',
  VACCINE_REGISTERED = 'VACCINE_REGISTERED',
  HOSPITALIZATION_STARTED = 'HOSPITALIZATION_STARTED',
  HOSPITALIZATION_DISCHARGED = 'HOSPITALIZATION_DISCHARGED',
  INVOICE_CREATED = 'INVOICE_CREATED',
  INVOICE_VOIDED = 'INVOICE_VOIDED',
  INVENTORY_ADJUSTED = 'INVENTORY_ADJUSTED',
  SERVICE_CREATED_OR_EDITED = 'SERVICE_CREATED_OR_EDITED',
  SERVICE_DEACTIVATED = 'SERVICE_DEACTIVATED',
  APPOINTMENT_PAYMENT_REGISTERED = 'APPOINTMENT_PAYMENT_REGISTERED',
  USER_SUSPENDED = 'USER_SUSPENDED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  VETERINARIAN = 'VETERINARIAN',
  CLIENT = 'CLIENT',
}

@Entity('audit_events')
export class AuditEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  actionType: ActionType;

  @Column()
  userId: string;

  @Column()
  userFullName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  userRole: UserRole;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  occurredAt: Date;
}