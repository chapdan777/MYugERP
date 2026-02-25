import { Injectable, Inject, Logger } from '@nestjs/common';
import { WorkOrder } from '../entities/work-order.entity';
import { WorkOrderItem } from '../entities/work-order-item.entity';
import { IWorkOrderRepository, WORK_ORDER_REPOSITORY } from '../repositories/work-order.repository.interface';
import type { IOrderItemComponentRepository } from '../../../production/domain/repositories/order-item-component.repository.interface';
import { ORDER_ITEM_COMPONENT_REPOSITORY } from '../../../production/domain/repositories/order-item-component.repository.interface';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ComponentGenerationService } from '../../../production/domain/services/component-generation.service';
import { FormulaEvaluatorService } from '../../../common/services/formula-evaluator.service';

/**
 * Входные данные для генерации заказ-нарядов
 */

export interface OrderItemForGeneration {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unit: string;
  width: number;
  height: number;
  depth?: number;
  propertyValues: Map<number, number>; // Map<propertyId, propertyValueId>
  propertiesVariableMap: Record<string, any>; // Map<variableName, value> для формул
}

export interface OperationStepForGeneration {
  operationId: number;
  operationCode: string;
  operationName: string;
  stepNumber: number;
  isRequired: boolean;
}

export interface OperationRateForGeneration {
  operationId: number;
  propertyValueId: number | null;
  ratePerUnit: number;
  timePerUnit: number;
}

export interface DepartmentForOperation {
  departmentId: number;
  departmentName: string;
  priority: number;
}

export interface OperationMaterialForGeneration {
  operationId: number;
  productId?: number;
  materialId: number;
  materialName: string;
  consumptionFormula: string;
  unit: string;
}

export interface ComponentSchemaForGeneration {
  name: string;
  lengthFormula: string;
  widthFormula: string;
  quantityFormula: string;
}

export interface OrderDataForGeneration {
  orderId: number;
  orderNumber: string;
  deadline: Date | null;
  items: OrderItemForGeneration[];
}

/**
 * WorkOrderGenerationService - Доменный сервис
 * 
 * Отвечает за генерацию заказ-нарядов из заказа путем:
 * 1. Построения технологических маршрутов для каждого изделия
 * 2. Расчета нормативной трудоемкости и сдельной оплаты
 * 3. Расчета необходимых материалов (на основе формул)
 * 4. Декомпозиции изделий на компоненты (детали)
 * 5. Создания заказ-нарядов
 */
@Injectable()
export class WorkOrderGenerationService {
  private readonly logger = new Logger(WorkOrderGenerationService.name);

  constructor(
    @Inject(WORK_ORDER_REPOSITORY)
    private readonly workOrderRepository: IWorkOrderRepository,
    @Inject(ORDER_ITEM_COMPONENT_REPOSITORY)
    private readonly orderItemComponentRepository: IOrderItemComponentRepository,
    private readonly componentGenerationService: ComponentGenerationService,
    private readonly formulaEvaluator: FormulaEvaluatorService,
  ) { }

  /**
   * Сгенерировать заказ-наряды для заказа
   * Возвращает массив созданных заказ-нарядов
   */
  async generateWorkOrders(input: {
    orderData: OrderDataForGeneration;
    operationSteps: Map<number, OperationStepForGeneration[]>; // Map<productId, steps[]>
    operationRates: OperationRateForGeneration[];
    departmentsByOperation: Map<number, DepartmentForOperation[]>; // Map<operationId, departments[]>
    operationMaterials: OperationMaterialForGeneration[];
    componentSchemas: Map<number, ComponentSchemaForGeneration[]>; // Map<productId, schemas[]>
  }): Promise<WorkOrder[]> {
    const { orderData, operationSteps, operationRates, departmentsByOperation, operationMaterials, componentSchemas } = input;

    // Валидация входных данных
    this.validateInput(orderData, operationSteps, departmentsByOperation);

    const workOrders: WorkOrder[] = [];

    // Расчет приоритета на основе дедлайна
    const priority = this.calculatePriorityFromDeadline(orderData.deadline);

    for (const item of orderData.items) {
      // 1. Декомпозиция изделия на компоненты
      const schemas = componentSchemas.get(item.productId) || [];
      if (schemas.length > 0) {
        try {
          const components = this.componentGenerationService.generateComponents(
            {
              id: item.id,
              width: item.width,
              height: item.height,
              depth: item.depth,
              properties: item.propertiesVariableMap
            },
            schemas
          );

          // Сохраняем сгенерированные компоненты
          await this.orderItemComponentRepository.deleteByOrderItemId(item.id);
          for (const component of components) {
            await this.orderItemComponentRepository.save(component);
            this.logger.debug(`Saved component ${component.getName()} for item ${item.id}`);
          }

          this.logger.log(`Сгенерировано и сохранено ${components.length} компонентов для позиции ${item.id}`);
        } catch (e: any) {
          this.logger.error(`Ошибка генерации компонентов для позиции ${item.id}: ${e.message}`);
        }
      }

      const steps = operationSteps.get(item.productId);
      if (!steps || steps.length === 0) {
        throw new DomainException(
          `Не найден технологический маршрут для продукта ${item.productId}`,
        );
      }

      // Создание заказ-наряда для каждой операции
      for (const step of steps) {
        // Skip operationId=0 - это псевдо-операция для "material-only" маршрутов
        // Материалы будут связаны через другую операцию или рассчитаны отдельно
        if (step.operationId === 0) {
          this.logger.debug(`Пропущена операция 0 (material-only) для продукта ${item.productId}`);
          continue;
        }

        // Поиск подходящего участка
        const departments = departmentsByOperation.get(step.operationId);
        if (!departments || departments.length === 0) {
          throw new DomainException(
            `Не найден участок для операции ${step.operationId}`,
          );
        }

        // Выбор участка с наивысшим приоритетом
        const selectedDepartment = this.selectOptimalDepartment(departments);

        // Расчет трудоемкости и зарплаты
        const { estimatedHours, pieceRate } = this.calculateOperationMetrics(
          item,
          step.operationId,
          operationRates,
        );

        // Расчет материалов для операции
        const calculatedMaterials = this.calculateOperationMaterials(
          item,
          step.operationId,
          operationMaterials
        );

        // Генерация номера ЗН
        const workOrderNumber = await this.workOrderRepository.generateWorkOrderNumber();

        // Создание заказ-наряда
        const workOrder = WorkOrder.create({
          workOrderNumber,
          orderId: orderData.orderId,
          orderNumber: orderData.orderNumber,
          departmentId: selectedDepartment.departmentId,
          departmentName: selectedDepartment.departmentName,
          operationId: step.operationId,
          operationName: step.operationName,
          priority,
          deadline: orderData.deadline,
        });

        // Создание позиции заказ-наряда
        const workOrderItem = WorkOrderItem.create({
          workOrderId: 0,
          orderItemId: item.id,
          productId: item.productId,
          productName: item.productName,
          operationId: step.operationId,
          operationName: step.operationName,
          quantity: item.quantity,
          unit: item.unit,
          estimatedHours,
          pieceRate,
          calculatedMaterials: {
            materials: calculatedMaterials,
            dimensions: {
              width: item.width,
              height: item.height,
              depth: item.depth || 0,
            }
          },
        });

        // Добавление позиции
        workOrder.addItem(workOrderItem);

        // Сохранение
        const savedWorkOrder = await this.workOrderRepository.save(workOrder);
        workOrders.push(savedWorkOrder);
      }
    }

    return workOrders;
  }

  /**
   * Расчет материалов для операции на основе формул
   */
  private calculateOperationMaterials(
    item: OrderItemForGeneration,
    operationId: number,
    materials: OperationMaterialForGeneration[]
  ): any[] {
    const result: any[] = [];
    const applicableMaterials = materials.filter(m =>
      m.operationId === operationId &&
      (!m.productId || m.productId === item.productId)
    );

    // Контекст для формул (габариты + переменные свойства)
    const context = {
      H: item.height,
      W: item.width,
      D: item.depth || 0,
      Q: item.quantity,
      ...item.propertiesVariableMap
    };

    for (const mat of applicableMaterials) {
      try {
        const quantityPerUnit = this.formulaEvaluator.evaluate(mat.consumptionFormula, context);
        const totalQuantity = quantityPerUnit * item.quantity;

        if (totalQuantity > 0) {
          result.push({
            materialId: mat.materialId,
            materialName: mat.materialName,
            quantity: totalQuantity,
            unit: mat.unit
          });
        }
      } catch (e: any) {
        this.logger.error(`Ошибка расчета материала ${mat.materialName} для операции ${operationId}: ${e.message}`);
      }
    }
    return result;
  }

  /**
   * Расчет приоритета (1-10) на основе дедлайна
   */
  private calculatePriorityFromDeadline(deadline: Date | null): number {
    if (!deadline) {
      return 5; // Средний приоритет
    }

    const now = new Date();
    const daysUntilDeadline = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilDeadline <= 0) return 10;
    if (daysUntilDeadline <= 3) return 9;
    if (daysUntilDeadline <= 7) return 8;
    if (daysUntilDeadline <= 14) return 7;
    if (daysUntilDeadline <= 21) return 6;
    if (daysUntilDeadline <= 30) return 5;
    if (daysUntilDeadline <= 60) return 4;
    if (daysUntilDeadline <= 90) return 3;
    if (daysUntilDeadline <= 180) return 2;
    return 1;
  }

  /**
   * Выбор оптимального участка
   */
  private selectOptimalDepartment(
    departments: DepartmentForOperation[],
  ): DepartmentForOperation {
    const sorted = [...departments].sort((a, b) => b.priority - a.priority);
    return sorted[0];
  }

  /**
   * Расчет трудоемкости и сдельной оплаты
   */
  private calculateOperationMetrics(
    item: OrderItemForGeneration,
    operationId: number,
    operationRates: OperationRateForGeneration[],
  ): { estimatedHours: number; pieceRate: number } {
    let specificRate: OperationRateForGeneration | undefined;
    let generalRate: OperationRateForGeneration | undefined;

    for (const rate of operationRates) {
      if (rate.operationId !== operationId) continue;

      if (rate.propertyValueId === null) {
        generalRate = rate;
      } else {
        for (const [, propertyValueId] of item.propertyValues) {
          if (propertyValueId === rate.propertyValueId) {
            specificRate = rate;
            break;
          }
        }
      }
    }

    const applicableRate = specificRate || generalRate;

    if (!applicableRate) {
      return {
        estimatedHours: 0,
        pieceRate: 0,
      };
    }

    const estimatedHours = applicableRate.timePerUnit * item.quantity;
    const pieceRate = applicableRate.ratePerUnit;

    return {
      estimatedHours,
      pieceRate,
    };
  }

  /**
   * Валидация входных данных
   */
  private validateInput(
    orderData: OrderDataForGeneration,
    operationSteps: Map<number, OperationStepForGeneration[]>,
    departmentsByOperation: Map<number, DepartmentForOperation[]>,
  ): void {
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      throw new DomainException('Заказ должен содержать хотя бы одну позицию');
    }

    if (!operationSteps || operationSteps.size === 0) {
      throw new DomainException('Необходимо предоставить этапы операций');
    }

    if (!departmentsByOperation || departmentsByOperation.size === 0) {
      throw new DomainException('Необходимо предоставить маппинг участков');
    }
  }

  /**
   * Проверка возможности генерации заказ-нарядов
   */
  canGenerateWorkOrders(orderData: OrderDataForGeneration): {
    canGenerate: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];

    if (!orderData.items || orderData.items.length === 0) {
      reasons.push('Order has no items');
    }

    for (const item of orderData.items || []) {
      if (item.quantity <= 0) {
        reasons.push(`Item ${item.id} has invalid quantity`);
      }
    }

    return {
      canGenerate: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Перегенерация заказ-нарядов
   */
  async regenerateWorkOrders(
    orderId: number,
    input: {
      orderData: OrderDataForGeneration;
      operationSteps: Map<number, OperationStepForGeneration[]>;
      operationRates: OperationRateForGeneration[];
      departmentsByOperation: Map<number, DepartmentForOperation[]>;
      operationMaterials: OperationMaterialForGeneration[];
      componentSchemas: Map<number, ComponentSchemaForGeneration[]>;
    },
  ): Promise<WorkOrder[]> {
    const existingWorkOrders = await this.workOrderRepository.findByOrderId(orderId);

    for (const workOrder of existingWorkOrders) {
      if (!workOrder.isCompleted() && !workOrder.isCancelled()) {
        workOrder.cancel('Перегенерация заказ-нарядов из-за обновления заказа');
        await this.workOrderRepository.save(workOrder);
      }
    }

    return await this.generateWorkOrders(input);
  }
}
