import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_COMPONENT_SCHEMA_REPOSITORY } from '../../domain/repositories/product-component-schema.repository.interface';
import type { IProductComponentSchemaRepository } from '../../domain/repositories/product-component-schema.repository.interface';
import { PRODUCT_REPOSITORY, PRODUCT_PROPERTY_REPOSITORY } from '../../../products/domain/repositories/injection-tokens';
import { IProductRepository } from '../../../products/domain/repositories/product.repository.interface';
import { IProductPropertyRepository } from '../../../products/domain/repositories/product-property.repository.interface';
import { PROPERTY_REPOSITORY } from '../../../properties/domain/repositories/injection-tokens';
import { IPropertyRepository } from '../../../properties/domain/repositories/property.repository.interface';

/**
 * Узел дерева вложенных свойств продукта
 */
export interface NestedProductNode {
    /** ID продукта */
    productId: number;
    /** Название продукта */
    productName: string;
    /** Название компонента в BOM-схеме родителя */
    componentName: string;
    /** Свойства этого продукта */
    properties: Array<{
        propertyId: number;
        propertyName: string;
        propertyCode?: string;
        defaultValue: string | null;
        isRequired: boolean;
    }>;
    /** Дочерние компоненты (рекурсия) */
    children: NestedProductNode[];
    /** Формула условия для отображения компонента из BOM */
    conditionFormula?: string | null;
}

/**
 * Use Case: Получение дерева вложенных свойств продукта
 *
 * Рекурсивно обходит BOM-структуру, собирая свойства каждой
 * дочерней номенклатуры (через childProductId).
 */
@Injectable()
export class GetNestedProductPropertiesUseCase {
    /** Максимальная глубина рекурсии для защиты от циклов */
    private static readonly MAX_DEPTH = 5;

    constructor(
        @Inject(PRODUCT_COMPONENT_SCHEMA_REPOSITORY)
        private readonly schemaRepository: IProductComponentSchemaRepository,
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: IProductRepository,
        @Inject(PRODUCT_PROPERTY_REPOSITORY)
        private readonly productPropertyRepository: IProductPropertyRepository,
        @Inject(PROPERTY_REPOSITORY)
        private readonly propertyRepository: IPropertyRepository,
    ) { }

    /**
     * Получить дерево вложенных свойств для продукта
     * @param productId - ID корневого продукта
     * @returns массив дочерних узлов с их свойствами
     */
    async execute(productId: number): Promise<NestedProductNode[]> {
        // Предзагружаем все свойства, чтобы не делать по запросу на каждое
        const allPropertiesLookup = new Map<number, { name: string, code: string }>();
        const allProps = await this.propertyRepository.findAll();
        for (const prop of allProps) {
            allPropertiesLookup.set(prop.getId() as number, { name: prop.getName(), code: prop.getCode() });
        }

        return this.buildTree(productId, 0, new Set<number>(), allPropertiesLookup);
    }

    /**
     * Рекурсивно строит дерево вложенных свойств
     * @param productId - ID текущего продукта
     * @param depth - текущая глубина рекурсии
     * @param visited - множество уже посещённых ID для защиты от циклов
     * @param propertiesLookup - предзагруженные данные о свойствах
     */
    private async buildTree(
        productId: number,
        depth: number,
        visited: Set<number>,
        propertiesLookup: Map<number, { name: string, code: string }>
    ): Promise<NestedProductNode[]> {
        // Защита от бесконечной рекурсии
        if (depth >= GetNestedProductPropertiesUseCase.MAX_DEPTH) {
            return [];
        }

        // Защита от циклических ссылок
        if (visited.has(productId)) {
            return [];
        }
        visited.add(productId);

        // Получаем BOM текущего продукта
        const schemas = await this.schemaRepository.findByProductId(productId);

        // Фильтруем только те, у которых есть дочерняя номенклатура
        const childSchemas = schemas.filter(s => s.hasChildProduct());

        const result: NestedProductNode[] = [];

        for (const schema of childSchemas) {
            const childProductId = schema.getChildProductId()!;

            // Получаем данные дочернего продукта
            const childProduct = await this.productRepository.findById(childProductId);
            if (!childProduct) {
                continue;
            }

            // Получаем свойства дочернего продукта
            const productProperties = await this.productPropertyRepository.findByProductId(childProductId);

            const properties = productProperties
                .filter(pp => pp.getIsActive())
                .map(pp => {
                    const propDef = propertiesLookup.get(pp.getPropertyId());
                    return {
                        propertyId: pp.getPropertyId(),
                        propertyName: propDef?.name || `Свойство #${pp.getPropertyId()}`,
                        propertyCode: propDef?.code,
                        defaultValue: pp.getDefaultValue(),
                        isRequired: pp.getIsRequired(),
                    };
                });

            // Рекурсивно строим поддерево
            const children = await this.buildTree(
                childProductId,
                depth + 1,
                new Set(visited),
                propertiesLookup
            );

            result.push({
                productId: childProductId,
                productName: childProduct.getName(),
                componentName: schema.getName(),
                conditionFormula: schema.getConditionFormula() || null,
                properties,
                children,
            });
        }

        return result;
    }
}
