/// Autor: María Paz Puerta Acevedo
/// Historia: BH-26 (CRUD productos) + BH-4 (RBAC)
/// Versión: 2.0.0

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
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear producto', description: 'Solo ADMIN.' })
  @ApiResponse({ status: 201, description: 'Producto creado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Listar todos los productos',
    description: 'ADMIN, VETERINARIAN, RECEPTIONIST.',
  })
  @ApiResponse({ status: 200, description: 'Lista de productos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get('low-stock')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Productos bajo stock mínimo',
    description: 'Solo ADMIN.',
  })
  @ApiResponse({ status: 200, description: 'Lista de productos con stock bajo' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  findLowStock() {
    return this.productsService.findLowStock();
  }

  @Get('expiring-soon')
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN)
  @ApiOperation({
    summary: 'Productos próximos a vencer',
    description: 'ADMIN y VETERINARIAN.',
  })
  @ApiResponse({ status: 200, description: 'Lista de productos próximos a vencer' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  findExpiringSoon() {
    return this.productsService.findExpiringSoon();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN, UserRole.RECEPTIONIST)
  @ApiOperation({
    summary: 'Obtener producto por ID',
    description: 'ADMIN, VETERINARIAN, RECEPTIONIST.',
  })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Actualizar producto completo',
    description: 'Solo ADMIN.',
  })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/stock')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Ajustar stock manualmente',
    description: 'Solo ADMIN.',
  })
  @ApiResponse({ status: 200, description: 'Stock actualizado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  adjustStock(@Param('id') id: string, @Body() dto: UpdateStockDto) {
    return this.productsService.adjustStock(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar producto', description: 'Solo ADMIN.' })
  @ApiResponse({ status: 200, description: 'Producto eliminado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Patch(':id/automatic-discount/:quantity')
  @Roles(UserRole.ADMIN, UserRole.VETERINARIAN)
  @ApiOperation({
    summary: 'Disminuir stock automáticamente',
    description: 'ADMIN y VETERINARIAN — usado al dispensar medicamentos.',
  })
  @ApiResponse({ status: 200, description: 'Stock descontado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso' })
  automaticDiscount(
    @Param('id') id: string,
    @Param('quantity') quantity: string,
  ) {
    return this.productsService.decreaseStockAutomatically(
      id,
      parseInt(quantity, 10),
    );
  }
}
