/// Autor: milerickhenaor-alt
/// Version: 0.1
feature/BH-22-desarrollar-proceso-internacion-medica-mascotas
/// Rama: BH-22-desarrollar-proceso-internacion-medica-mascotas

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateHospitalizationDto } from './dto/create-hospitalization.dto';
/// Rama: BH-23-implementar-registro-alta-egreso-clinico-paciente

import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateHospitalizationDto } from './dto/create-hospitalization.dto';
import { DischargeHospitalizationDto } from './dto/discharge-hospitalization.dto';
develop
import { HospitalizationsService } from './hospitalizations.service';

@Controller('hospitalizations')
export class HospitalizationsController {
  constructor(private readonly hospitalizationsService: HospitalizationsService) {}

  @Post()
  create(@Body() dto: CreateHospitalizationDto) {
    return this.hospitalizationsService.create(dto);
  }

feature/BH-22-desarrollar-proceso-internacion-medica-mascotas
  @Patch(':id/discharge')
  discharge(@Param('id') id: string, @Body() dto: DischargeHospitalizationDto) {
    return this.hospitalizationsService.discharge(id, dto);
  }
develop
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hospitalizationsService.findOne(id);
  }

  @Get('pet/:petId')
  findByPet(@Param('petId') petId: string) {
    return this.hospitalizationsService.findByPet(petId);
  }
}