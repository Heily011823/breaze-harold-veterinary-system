/// Autor: Mateo Quintero
/// Version: 0.1
/// Rama: BH-17-registro-consultas

import { Body, Controller, Post, Req, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { MedicalRecordsService } from './medical-records.service';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
  ) {}

  @Post()
  create(@Body() dto: CreateMedicalRecordDto, @Req() req: Request) {
    // Extract user from JWT token (attached to request by auth middleware)
    const user = req['user'];
    if (!user) {
      throw new BadRequestException('User not found in request');
    }

    // Check if user has veterinarian role
    if (user.role !== 'VETERINARIAN') {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.medicalRecordsService.create({
      petId: dto.petId,
      visitReason: dto.visitReason,
      diagnosis: dto.diagnosis,
      currentWeight: dto.currentWeight,
      veterinarianId: user.id,
    });
  }
}