import { Injectable, Inject, NotFoundException } from '@nestjs/common';
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
    ) { }

    async execute(orderId: number): Promise<WorkOrder[]> {
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

            // Populate maps from item properties
            item.getProperties().forEach(prop => {
                // For variables (numeric values)
                const numValue = parseFloat(prop.getValue());
                if (!isNaN(numValue)) {
                    propertiesVariableMap[prop.getPropertyCode()] = numValue;
                }

                // For rate selection (value IDs)
                // Note: PropertyInOrder might not store ID if it's a direct value
                // In this system, we currently use the numeric value as ID for selection if applicable
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

        // Получение всех ID продуктов
        const productIds = Array.from(new Set(orderData.items.map(i => i.productId)));

        // Получение маршрутов и материалов
        for (const productId of productIds) {
            const route = await this.routeRepository.findActiveByProductId(productId);
            if (route) {
                // Steps
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

                // Materials
                for (const step of route.getSteps()) {
                    for (const mat of step.getMaterials()) {
                        // Fetch material product info to get name
                        // Optimization: Should probably collect IDs and fetch in bulk, but for now individual fetch
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
                }

                // Сбор ID операций для получения участков и ставок
                for (const step of route.getSteps()) {
                    const opId = step.getOperationId();
                    if (!departmentsByOperation.has(opId)) {
                        // Получение участков для операции
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

        // 4. Запуск генерации
        return this.generationService.generateWorkOrders({
            orderData,
            operationSteps,
            operationRates,
            departmentsByOperation,
            operationMaterials,
            componentSchemas // Схемы компонентов передаются (если найдены)
        });
    }
}
