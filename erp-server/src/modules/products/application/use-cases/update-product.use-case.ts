import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { ProductCategory } from '../../domain/enums/product-category.enum';
import { UnitOfMeasure } from '../../domain/value-objects/unit-of-measure.vo';

export class UpdateProductDto {
  name?: string;
  description?: string;
  basePrice?: number;
  unit?: string;
  category?: ProductCategory;
  defaultLength?: number;
  defaultWidth?: number;
  defaultDepth?: number;
}

/**
 * Use Case: Обновление информации о продукте
 */
@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) { }

  async execute(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException(`Продукт с ID ${id} не найден`);
    }

    // Создание value object для единицы измерения если она обновляется
    const unit = dto.unit ? UnitOfMeasure.create(dto.unit) : undefined;

    console.log('📦 UpdateProductUseCase executing for ID:', id);
    console.log('📝 DTO received:', JSON.stringify(dto, null, 2));

    // Обновление через доменный метод
    product.updateInfo({
      name: dto.name,
      description: dto.description,
      basePrice: dto.basePrice,
      unit,
      category: dto.category,
      defaultLength: dto.defaultLength,
      defaultWidth: dto.defaultWidth,
      defaultDepth: dto.defaultDepth,
    });

    console.log('🛠 Product state after updateInfo:', {
      name: product.getName(),
      L: product.getDefaultLength(),
      W: product.getDefaultWidth(),
      D: product.getDefaultDepth()
    });

    const savedProduct = await this.productRepository.save(product);
    console.log('✅ Product saved successfully');
    return savedProduct;
  }
}
