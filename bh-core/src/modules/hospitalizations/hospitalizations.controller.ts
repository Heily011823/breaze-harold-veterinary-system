/// Autor: milerickhenaor-alt
/// Version: 0.1
/// Rama: BH-22-desarrollar-proceso-internacion-medica-mascotas

import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateHospitalizationDto } from './dto/create-hospitalization.dto';
import { DischargeHospitalizationDto } from './dto/discharge-hospitalization.dto';
import { HospitalizationsService } from './hospitalizations.service';

@Controller('hospitalizations')
export class HospitalizationsController {
  constructor(private readonly hospitalizationsService: HospitalizationsService) {}

  @Post()
  create(@Body() dto: CreateHospitalizationDto) {
    return this.hospitalizationsService.create(dto);
  }

  @Patch(':id/discharge')
  discharge(@Param('id') id: string, @Body() dto: DischargeHospitalizationDto) {
    return this.hospitalizationsService.discharge(id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hospitalizationsService.findOne(id);
  }

  @Get('pet/:petId')
  findByPet(@Param('petId') petId: string) {
    return this.hospitalizationsService.findByPet(petId);
  }
}
