import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PRODUCT_REPOSITORY, PRODUCT_PROPERTY_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { IProductPropertyRepository } from '../../domain/repositories/product-property.repository.interface';
import { PRODUCT_COMPONENT_SCHEMA_REPOSITORY } from '../../../production/domain/repositories/product-component-schema.repository.interface';
import type { IProductComponentSchemaRepository } from '../../../production/domain/repositories/product-component-schema.repository.interface';
import { TECHNOLOGICAL_ROUTE_REPOSITORY } from '../../../production/domain/repositories/technological-route.repository.interface';
import type { ITechnologicalRouteRepository } from '../../../production/domain/repositories/technological-route.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { ProductProperty } from '../../domain/entities/product-property.entity';
import { ProductComponentSchema } from '../../../production/domain/entities/product-component-schema.entity';
import { TechnologicalRoute } from '../../../production/domain/entities/technological-route.entity';
import { RouteStep } from '../../../production/domain/entities/route-step.entity';
import { OperationMaterial } from '../../../production/domain/entities/operation-material.entity';
import { ProductClonedEvent } from '../../domain/events/product-cloned.event';

/**
 * Use Case: Клонирование изделия "со всеми потрохами"
 */
@Injectable()
export class CloneProductUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: IProductRepository,
        @Inject(PRODUCT_PROPERTY_REPOSITORY)
        private readonly productPropertyRepository: IProductPropertyRepository,
        @Inject(PRODUCT_COMPONENT_SCHEMA_REPOSITORY)
        private readonly componentSchemaRepository: IProductComponentSchemaRepository,
        @Inject(TECHNOLOGICAL_ROUTE_REPOSITORY)
        private readonly routeRepository: ITechnologicalRouteRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async execute(id: number): Promise<Product> {
        // 1. Находим исходный продукт
        const sourceProduct = await this.productRepository.findById(id);
        if (!sourceProduct) {
            throw new NotFoundException(`Продукт с ID ${id} не найден`);
        }

        // 2. Генерируем новый код и имя
        const newCode = `${sourceProduct.getCode()}_КОПИЯ_${Date.now().toString().slice(-4)}`;
        const newName = `${sourceProduct.getName()} (Копия)`;

        // Проверка уникальности кода
        const exists = await this.productRepository.existsByCode(newCode);
        if (exists) {
            throw new ConflictException(`Продукт с кодом "${newCode}" уже существует`);
        }

        // 3. Создаем новый продукт
        const clonedProduct = Product.create({
            name: newName,
            code: newCode,
            category: sourceProduct.getCategory(),
            description: sourceProduct.getDescription(),
            basePrice: sourceProduct.getBasePrice(),
            unit: sourceProduct.getUnit(),
            defaultLength: sourceProduct.getDefaultLength(),
            defaultWidth: sourceProduct.getDefaultWidth(),
            defaultDepth: sourceProduct.getDefaultDepth(),
        });

        const savedProduct = await this.productRepository.save(clonedProduct);
        const newProductId = savedProduct.getId()!;

        // 4. Копируем свойства (ProductProperty)
        const sourceProperties = await this.productPropertyRepository.findByProductId(id);
        for (const prop of sourceProperties) {
            const clonedProp = ProductProperty.create({
                productId: newProductId,
                propertyId: prop.getPropertyId(),
                isRequired: prop.getIsRequired(),
                displayOrder: prop.getDisplayOrder(),
                defaultValue: prop.getDefaultValue(),
                isActive: prop.getIsActive(),
            });
            await this.productPropertyRepository.save(clonedProp);
        }

        // 5. Копируем состав (BOM / ProductComponentSchema)
        const sourceSchemas = await this.componentSchemaRepository.findByProductId(id);
        for (const schema of sourceSchemas) {
            const clonedSchema = ProductComponentSchema.create({
                productId: newProductId,
                name: schema.getName(),
                lengthFormula: schema.getLengthFormula(),
                widthFormula: schema.getWidthFormula(),
                depthFormula: schema.getDepthFormula(),
                quantityFormula: schema.getQuantityFormula(),
                conditionFormula: schema.getConditionFormula(),
                childProductId: schema.getChildProductId(),
                sortOrder: schema.getSortOrder(),
            });
            await this.componentSchemaRepository.save(clonedSchema);
        }

        // 6. Копируем технологические маршруты (TechnologicalRoute)
        const sourceRoutes = await this.routeRepository.findByProductId(id);
        for (const route of sourceRoutes) {
            const clonedRoute = TechnologicalRoute.create({
                productId: newProductId,
                name: route.getName(),
                description: route.getDescription(),
                isActive: route.getIsActive(),
            });

            // Копируем шаги маршрута
            for (const step of route.getSortedSteps()) {
                // Сначала копируем материалы шага
                const materials = step.getMaterials().map(mat => OperationMaterial.create({
                    operationId: step.getOperationId(),
                    materialId: mat.getMaterialId(),
                    consumptionFormula: mat.getConsumptionFormula(),
                    unit: mat.getUnit(),
                }));

                const clonedStep = RouteStep.create({
                    routeId: 0, // Будет установлено при сохранении маршрута
                    operationId: step.getOperationId(),
                    stepNumber: step.getStepNumber(),
                    description: step.getDescription(),
                    isRequired: step.getIsRequired(),
                    conditionFormula: step.getConditionFormula(),
                    materials: materials,
                });

                clonedRoute.addStep(clonedStep);
            }

            await this.routeRepository.save(clonedRoute);
        }

        // 7. Опубликовать событие для клонирования связей в других модулях (например, шапки свойств)
        this.eventEmitter.emit('product.cloned', new ProductClonedEvent(id, newProductId));

        return savedProduct;
    }
}
