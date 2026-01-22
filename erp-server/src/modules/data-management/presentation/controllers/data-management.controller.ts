/**
 * @file Контроллер управления данными
 * @description Предоставляет API для централизованного управления основными сущностями системы
 * включая пользователей, номенклатуру, свойства, шапки заказов и значения свойств.
 */

import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { DataManagementService } from '../../application/services/data-management.service';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { CreateProductDto } from '../../application/dto/create-product.dto';
import { CreatePropertyDto } from '../../application/dto/create-property.dto';
import { CreateOrderHeaderDto } from '../../application/dto/create-order-header.dto';
import { CreatePropertyValueDto } from '../../application/dto/create-property-value.dto';

@ApiTags('data-management')
@Controller('data-management')
export class DataManagementController {
  constructor(private readonly dataManagementService: DataManagementService) {}

  /**
   * Получить всех пользователей
   */
  @Get('users')
  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({ status: 200, description: 'Список пользователей успешно получен.' })
  async getAllUsers(@Query() query?: any) {
    return await this.dataManagementService.getAllUsers(query);
  }

  /**
   * Создать нового пользователя
   */
  @Post('users')
  @ApiOperation({ summary: 'Создать нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно создан.' })
  @ApiResponse({ status: 400, description: 'Неверные данные пользователя.' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.dataManagementService.createUser(createUserDto);
  }

  /**
   * Получить все продукты/номенклатуру
   */
  @Get('products')
  @ApiOperation({ summary: 'Получить всю номенклатуру' })
  @ApiResponse({ status: 200, description: 'Список номенклатуры успешно получен.' })
  async getAllProducts(@Query() query?: any) {
    return await this.dataManagementService.getAllProducts(query);
  }

  /**
   * Создать новый продукт
   */
  @Post('products')
  @ApiOperation({ summary: 'Создать новый продукт' })
  @ApiResponse({ status: 201, description: 'Продукт успешно создан.' })
  @ApiResponse({ status: 400, description: 'Неверные данные продукта.' })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return await this.dataManagementService.createProduct(createProductDto);
  }

  /**
   * Получить все свойства
   */
  @Get('properties')
  @ApiOperation({ summary: 'Получить все дополнительные свойства' })
  @ApiResponse({ status: 200, description: 'Список свойств успешно получен.' })
  async getAllProperties(@Query() query?: any) {
    return await this.dataManagementService.getAllProperties(query);
  }

  /**
   * Создать новое свойство
   */
  @Post('properties')
  @ApiOperation({ summary: 'Создать новое дополнительное свойство' })
  @ApiResponse({ status: 201, description: 'Свойство успешно создано.' })
  @ApiResponse({ status: 400, description: 'Неверные данные свойства.' })
  async createProperty(@Body() createPropertyDto: CreatePropertyDto) {
    return await this.dataManagementService.createProperty(createPropertyDto);
  }

  /**
   * Получить все шапки заказов
   */
  @Get('order-headers')
  @ApiOperation({ summary: 'Получить все шапки заказов' })
  @ApiResponse({ status: 200, description: 'Список шапок заказов успешно получен.' })
  async getAllOrderHeaders(@Query() query?: any) {
    return await this.dataManagementService.getAllOrderHeaders(query);
  }

  /**
   * Создать новую шапку заказа
   */
  @Post('order-headers')
  @ApiOperation({ summary: 'Создать новую шапку заказа' })
  @ApiResponse({ status: 201, description: 'Шапка заказа успешно создана.' })
  @ApiResponse({ status: 400, description: 'Неверные данные шапки заказа.' })
  async createOrderHeader(@Body() orderHeaderData: CreateOrderHeaderDto) {
    return await this.dataManagementService.createOrderHeader(orderHeaderData);
  }

  /**
   * Получить все значения свойств
   */
  @Get('property-values')
  @ApiOperation({ summary: 'Получить все значения свойств' })
  @ApiResponse({ status: 200, description: 'Список значений свойств успешно получен.' })
  async getAllPropertyValues(@Query() query?: any) {
    return await this.dataManagementService.getAllPropertyValues(query);
  }

  /**
   * Создать новое значение свойства
   */
  @Post('property-values')
  @ApiOperation({ summary: 'Создать новое значение свойства' })
  @ApiResponse({ status: 201, description: 'Значение свойства успешно создано.' })
  @ApiResponse({ status: 400, description: 'Неверные данные значения свойства.' })
  async createPropertyValue(@Body() propertyValueData: CreatePropertyValueDto) {
    return await this.dataManagementService.createPropertyValue(propertyValueData);
  }
}