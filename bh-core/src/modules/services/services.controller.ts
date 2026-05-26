import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ServicesService } from './services.service';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('Services')

@Controller('services')
export class ServicesController {

  constructor(private readonly servicesService: ServicesService,) {}

  @ApiOperation({
    summary: 'Create medical service',
  })
  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @ApiOperation({
    summary: 'Get all active services',
  })
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @ApiOperation({
    summary: 'Get service by id',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update service',
  })
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto,) {
    return this.servicesService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Deactivate service',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}