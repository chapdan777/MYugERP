import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { ProductCategory } from '../../domain/enums/product-category.enum';
import { UnitOfMeasure } from '../../domain/value-objects/unit-of-measure.vo';

export class CreateProductDto {
  name!: string;
  code!: string;
  category!: ProductCategory;
  description?: string;
  basePrice!: number;
  unit!: string;
  defaultLength?: number;
  defaultWidth?: number;
  defaultDepth?: number;
}

/**
 * Use Case: Создание нового продукта
 */
@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) { }

  async execute(dto: CreateProductDto): Promise<Product> {
    // Проверка уникальности кода
    const codeExists = await this.productRepository.existsByCode(dto.code);
    if (codeExists) {
      throw new ConflictException(`Продукт с кодом "${dto.code}" уже существует`);
    }

    // Создание value object для единицы измерения
    const unit = UnitOfMeasure.create(dto.unit);

    // Создание доменной сущности
    const product = Product.create({
      name: dto.name,
      code: dto.code,
      category: dto.category,
      description: dto.description,
      basePrice: dto.basePrice,
      unit,
      defaultLength: dto.defaultLength,
      defaultWidth: dto.defaultWidth,
      defaultDepth: dto.defaultDepth,
    });

    return this.productRepository.save(product);
  }
}
