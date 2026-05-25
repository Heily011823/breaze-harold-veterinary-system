/// Autor: María Paz Puerta Acevedo
/// Version: 1.0.0
/// Rama: feature/BH-26-implementar-administracion-completa-crud-productos

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ProductsService } from './products.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

// Seguridad pendiente de integración con módulo auth

// import { UseGuards } from '@nestjs/common';

// import { ApiBearerAuth } from '@nestjs/swagger';

// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';

// import { Roles } from '../auth/decorators/roles.decorator';

// import { Role } from '../auth/enums/role.enum';

@ApiTags('Products')

// Seguridad pendiente de integración con autenticación y roles

// @ApiBearerAuth()

// @UseGuards(JwtAuthGuard, RolesGuard)

// @Roles(Role.ADMIN)

@Controller('products')
export class ProductsController {

  constructor(private readonly productsService: ProductsService,) {}

  @ApiOperation({
    summary: 'Create product',
  })
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @ApiOperation({
    summary: 'Get all products',
  })
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // Pendiente restricción de acceso por roles ADMIN
  
  @ApiOperation({
    summary: 'Get products below minimum stock',
  })
  @Get('low-stock')
  findLowStock() {
    return this.productsService.findLowStock();
  }

  @ApiOperation({
    summary: 'Get products close to expiration date',
  })
  @Get('expiring-soon')
  findExpiringSoon() {
    return this.productsService.findExpiringSoon();
  }

  @ApiOperation({
    summary: 'Get product by id',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update product',
  })
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto,) {
    return this.productsService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Adjust product stock manually',
  })
  @Patch(':id/stock')
  adjustStock(@Param('id') id: string, @Body() dto: UpdateStockDto,) {
    return this.productsService.adjustStock(id, dto);
  }

  @ApiOperation({
    summary: 'Delete product',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
