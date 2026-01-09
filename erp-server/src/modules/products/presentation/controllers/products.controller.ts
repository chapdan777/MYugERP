import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductRequestDto } from '../dto/update-product-request.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ProductCategory } from '../../domain/enums/product-category.enum';
import {
  CreateProductUseCase,
  GetProductByIdUseCase,
  GetAllActiveProductsUseCase,
  UpdateProductUseCase,
  ActivateProductUseCase,
  DeactivateProductUseCase,
} from '../../application/use-cases';

/**
 * REST API контроллер для управления продуктами
 */
@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly getAllActiveProductsUseCase: GetAllActiveProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly activateProductUseCase: ActivateProductUseCase,
    private readonly deactivateProductUseCase: DeactivateProductUseCase,
  ) {}

  /**
   * Создание нового продукта
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.createProductUseCase.execute({
      name: dto.name,
      code: dto.code || '',
      category: dto.category as ProductCategory,
      description: dto.description || '',
      basePrice: dto.basePrice,
      unit: dto.unit,
    });
    return ProductResponseDto.fromDomain(product);
  }

  /**
   * Получение списка всех активных продуктов
   * Доступно всем авторизованным пользователям
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllActive(): Promise<ProductResponseDto[]> {
    const products = await this.getAllActiveProductsUseCase.execute();
    return ProductResponseDto.fromDomainList(products);
  }

  /**
   * Получение продукта по ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
    const product = await this.getProductByIdUseCase.execute(id);
    return ProductResponseDto.fromDomain(product);
  }

  /**
   * Обновление информации о продукте
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductRequestDto,
  ): Promise<ProductResponseDto> {
    const product = await this.updateProductUseCase.execute(id, {
      name: dto.name,
      description: dto.description,
      basePrice: dto.basePrice,
      unit: dto.unit,
      category: dto.category,
    });
    return ProductResponseDto.fromDomain(product);
  }

  /**
   * Активация продукта
   */
  @Put(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
    const product = await this.activateProductUseCase.execute(id);
    return ProductResponseDto.fromDomain(product);
  }

  /**
   * Деактивация продукта
   */
  @Put(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
    const product = await this.deactivateProductUseCase.execute(id);
    return ProductResponseDto.fromDomain(product);
  }
}
