import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WorkOrderGenerationService, OrderDataForGeneration, OperationStepForGeneration, OperationRateForGeneration, DepartmentForOperation, ComponentSchemaForGeneration } from '../../domain/services/work-order-generation.service';
import { WorkOrder } from '../../domain/entities/work-order.entity';
import { ORDER_REPOSITORY, IOrderRepository } from '../../../orders/domain/repositories/order.repository.interface';
import { TECHNOLOGICAL_ROUTE_REPOSITORY, ITechnologicalRouteRepository } from '../../../production/domain/repositories/technological-route.repository.interface';
import { PRODUCTION_DEPARTMENT_REPOSITORY, IProductionDepartmentRepository } from '../../../production/domain/repositories/production-department.repository.interface';
import { OPERATION_RATE_REPOSITORY, IOperationRateRepository } from '../../../production/domain/repositories/operation-rate.repository.interface';
import { PRODUCT_REPOSITORY } from '../../../products/domain/repositories/injection-tokens';
import { IProductRepository } from '../../../products/domain/repositories/product.repository.interface';
import { OperationMaterialForGeneration } from '../../domain/services/work-order-generation.service';
import { IOperationRepository, OPERATION_REPOSITORY } from '../../../production/domain/repositories/operation.repository.interface';
import type { IProductComponentSchemaRepository } from '../../../production/domain/repositories/product-component-schema.repository.interface';
import { PRODUCT_COMPONENT_SCHEMA_REPOSITORY } from '../../../production/domain/repositories/product-component-schema.repository.interface';
import { ComponentGenerationService } from '../../../production/domain/services/component-generation.service';

@Injectable()
export class GenerateWorkOrdersUseCase {
    constructor(
        private readonly generationService: WorkOrderGenerationService,
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: IOrderRepository,
        @Inject(TECHNOLOGICAL_ROUTE_REPOSITORY)
        private readonly routeRepository: ITechnologicalRouteRepository,
        @Inject(PRODUCTION_DEPARTMENT_REPOSITORY)
        private readonly departmentRepository: IProductionDepartmentRepository,
        @Inject(OPERATION_RATE_REPOSITORY)
        private readonly rateRepository: IOperationRateRepository,
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: IProductRepository,
        @Inject(OPERATION_REPOSITORY)
        private readonly operationRepository: IOperationRepository,
        @Inject(PRODUCT_COMPONENT_SCHEMA_REPOSITORY)
        private readonly schemaRepository: IProductComponentSchemaRepository,
        private readonly componentGenerationService: ComponentGenerationService,
        private readonly dataSource: DataSource,
    ) { }

    async execute(orderId: number, regenerate: boolean = false): Promise<WorkOrder[]> {
        // 1. Получение заказа
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new NotFoundException(`Заказ с ID ${orderId} не найден`);
        }

        // 2. Подготовка данных заказа
        // Сбор позиций из всех секций
        const orderItems = order.getSections().flatMap(section => section.getItems());

        const itemsForGeneration = orderItems.map(item => {
            const unitId = item.getUnit();
            let unitName = 'шт';
            if (unitId === 2) unitName = 'м2';
            if (unitId === 3) unitName = 'м.п.';

            const propertyValues = new Map<number, number>();
            const propertiesVariableMap: Record<string, any> = {};

            // For rate selection (value IDs)
            item.getProperties().forEach(prop => {
                const numValue = parseFloat(prop.getValue());
                if (!isNaN(numValue)) {
                    propertyValues.set(prop.getPropertyId(), numValue);
                }
            });

            return {
                id: item.getId() as number,
                productId: item.getProductId(),
                productName: item.getProductName() || `Продукт #${item.getProductId()}`,
                quantity: item.getQuantity(),
                unit: unitName,
                width: Number(item.getWidth()) || 0,
                height: Number(item.getLength()) || 0, // Маппинг Length -> Height
                depth: Number(item.getDepth()) || 0,
                propertyValues,
                propertiesVariableMap,
            };
        });

        // Обогащение propertiesVariableMap именами переменных
        for (const item of itemsForGeneration) {
            const propsData = await this.dataSource.query(`
                SELECT p."variableName", p."defaultValue", p."code", p.id, p."dataType", pio.value as "actualValue"
                FROM property_in_order pio
                JOIN properties p ON pio."propertyCode" = p.code
                WHERE pio."orderItemId" = $1
            `, [item.id]);

            for (const row of propsData) {
                const varName = row.variableName || row.code;
                const valStr = row.actualValue;

                let parsedVal: number | string | boolean = valStr;

                if (valStr === 'true') {
                    parsedVal = 1;
                } else if (valStr === 'false') {
                    parsedVal = 0;
                } else {
                    const numValue = parseFloat(valStr);
                    if (!isNaN(numValue) && String(numValue) === valStr) {
                        parsedVal = numValue;
                    }
                }

                item.propertiesVariableMap[varName] = parsedVal;
            }

            const propDefaults = await this.dataSource.query(`
                SELECT p."variableName", p."defaultValue", p.code
                FROM product_properties pp
                JOIN properties p ON pp."propertyId" = p.id
                WHERE pp."productId" = $1
                  AND p."variableName" IS NOT NULL
                  AND p."defaultValue" IS NOT NULL
            `, [item.productId]);

            for (const pd of propDefaults) {
                const varName = pd.variableName || pd.code;
                if (item.propertiesVariableMap[varName] === undefined) {
                    let parsedVal: number | string | boolean = pd.defaultValue;
                    if (pd.defaultValue === 'true') {
                        parsedVal = 1;
                    } else if (pd.defaultValue === 'false') {
                        parsedVal = 0;
                    } else {
                        const numVal = parseFloat(pd.defaultValue);
                        if (!isNaN(numVal) && String(numVal) === pd.defaultValue) {
                            parsedVal = numVal;
                        }
                    }

                    item.propertiesVariableMap[varName] = parsedVal;
                }
            }
        }

        console.log(`[GenerateWorkOrdersUseCase] Items for generation:`, JSON.stringify(itemsForGeneration.map(i => ({
            id: i.id,
            productId: i.productId,
            dims: `${i.height}x${i.width}x${i.depth}`,
            props: i.propertiesVariableMap
        })), null, 2));

        const orderData: OrderDataForGeneration = {
            orderId: order.getId() as number,
            orderNumber: order.getOrderNumber(),
            deadline: order.getDeadline() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            items: itemsForGeneration,
        };

        // 3. Сбор метаданных
        const operationSteps = new Map<number, OperationStepForGeneration[]>();
        const departmentsByOperation = new Map<number, DepartmentForOperation[]>();
        const componentSchemas = new Map<number, ComponentSchemaForGeneration[]>();
        const operationMaterials: OperationMaterialForGeneration[] = [];

        // Получение всех ID продуктов (включая рекурсивные компоненты)
        const topLevelProductIds = Array.from(new Set(orderData.items.map(i => i.productId)));
        const allProductIdsToLoadMetadata = new Set<number>(topLevelProductIds);

        // Сначала загружаем схемы компонентов рекурсивно, чтобы найти ВСЕ продукты в цепочке
        const processedProductIdsForSchemas = new Set<number>();
        const schemasToProcess = Array.from(topLevelProductIds);

        while (schemasToProcess.length > 0) {
            const currentProductId = schemasToProcess.pop()!;
            if (processedProductIdsForSchemas.has(currentProductId)) continue;
            processedProductIdsForSchemas.add(currentProductId);

            const schemas = await this.schemaRepository.findByProductId(currentProductId);
            if (schemas.length > 0) {
                const mappedSchemas: ComponentSchemaForGeneration[] = [];
                for (const schema of schemas) {
                    let childProductName: string | null = null;
                    if (schema.hasChildProduct()) {
                        const childId = schema.getChildProductId()!;
                        const childProduct = await this.productRepository.findById(childId);
                        childProductName = childProduct ? childProduct.getName() : null;

                        // Добавляем дочерний продукт в список всех продуктов и в очередь обработки схем
                        allProductIdsToLoadMetadata.add(childId);
                        if (!processedProductIdsForSchemas.has(childId)) {
                            schemasToProcess.push(childId);
                        }
                    }
                    mappedSchemas.push({
                        name: schema.getName(),
                        lengthFormula: schema.getLengthFormula(),
                        widthFormula: schema.getWidthFormula(),
                        quantityFormula: schema.getQuantityFormula(),
                        childProductId: schema.getChildProductId(),
                        childProductName,
                        depthFormula: schema.getDepthFormula(),
                        extraVariables: schema.getExtraVariables(),
                        conditionFormula: schema.getConditionFormula(),
                        sortOrder: schema.getSortOrder(),
                    });
                }
                componentSchemas.set(currentProductId, mappedSchemas);
            }
        }

        // Теперь загружаем маршруты и материалы для ВСЕХ найденных продуктов
        for (const productId of allProductIdsToLoadMetadata) {
            const route = await this.routeRepository.findActiveByProductId(productId);
            if (route) {
                const mappedSteps = [];
                for (const step of route.getSortedSteps()) {
                    const op = await this.operationRepository.findById(step.getOperationId());
                    mappedSteps.push({
                        operationId: step.getOperationId(),
                        operationCode: op?.getCode() || `OP-${step.getOperationId()}`,
                        operationName: op?.getName() || `Op ${step.getOperationId()}`,
                        stepNumber: step.getStepNumber(),
                        isRequired: step.getIsRequired(),
                    });
                }
                operationSteps.set(productId, mappedSteps);

                for (const step of route.getSteps()) {
                    for (const mat of step.getMaterials()) {
                        const materialProduct = await this.productRepository.findById(mat.getMaterialId());
                        operationMaterials.push({
                            operationId: step.getOperationId(),
                            productId: productId,
                            materialId: mat.getMaterialId(),
                            materialName: materialProduct ? materialProduct.getName() : `Material #${mat.getMaterialId()}`,
                            consumptionFormula: mat.getConsumptionFormula(),
                            unit: mat.getUnit(),
                        });
                    }

                    const opId = step.getOperationId();
                    if (!departmentsByOperation.has(opId)) {
                        const departments = await this.departmentRepository.findByOperationId(opId);
                        departmentsByOperation.set(opId, departments.map(d => ({
                            departmentId: d.departmentId,
                            departmentName: d.departmentName,
                            priority: d.priority
                        })));
                    }
                }
            }
        }

        // Получение ставок (Глобальных или по операциям)
        const allRates = await this.rateRepository.findAll();
        const operationRates: OperationRateForGeneration[] = allRates.map(r => ({
            operationId: r.getOperationId(),
            ratePerUnit: r.getRatePerUnit(),
            timePerUnit: r.getTimePerUnit(),
            propertyValueId: r.getPropertyValueId() || null,
        }));

        // 4. Генерируем полный список позиций для генерации (включая вложенные компоненты с маршрутами)
        const finalItemsForGeneration: any[] = [];

        // Подготовим вспомогательную функцию для рекурсивного сбора
        const processItemRecursively = async (item: any) => {
            finalItemsForGeneration.push(item);

            const schemas = componentSchemas.get(item.productId) || [];
            if (schemas.length > 0) {
                try {
                    const generated = this.componentGenerationService.generateComponentsDetailed(
                        {
                            id: item.id,
                            width: item.width,
                            height: item.height,
                            depth: item.depth,
                            properties: item.propertiesVariableMap
                        },
                        schemas,
                        componentSchemas
                    );

                    for (const gen of generated) {
                        if (gen.childProductId) {
                            // Проверяем, есть ли у дочернего продукта свой маршрут
                            const childRoute = await this.routeRepository.findActiveByProductId(gen.childProductId);
                            if (childRoute) {
                                // Если есть маршрут - добавляем в список генерации как отдельную позицию
                                await processItemRecursively({
                                    id: item.id, // Ссылаемся на родительскую позицию
                                    productId: gen.childProductId,
                                    productName: gen.orderItemComponent.getName(),
                                    quantity: gen.calculatedQuantity * item.quantity,
                                    unit: 'шт',
                                    width: gen.calculatedWidth,
                                    height: gen.calculatedLength,
                                    depth: gen.calculatedDepth,
                                    propertyValues: new Map(), // Свойства наследуются через propertiesVariableMap
                                    propertiesVariableMap: { ...item.propertiesVariableMap }
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Ошибка при рекурсивном разборе BOM для ${item.productName}:`, e);
                }
            }
        };

        for (const item of itemsForGeneration) {
            await processItemRecursively(item);
        }

        orderData.items = finalItemsForGeneration;

        // 5. Запуск генерации
        if (regenerate) {
            return this.generationService.regenerateWorkOrders(orderId, {
                orderData,
                operationSteps,
                operationRates,
                departmentsByOperation,
                operationMaterials,
                componentSchemas
            });
        }

        return this.generationService.generateWorkOrders({
            orderData,
            operationSteps,
            operationRates,
            departmentsByOperation,
            operationMaterials,
            componentSchemas
        });
    }
}
