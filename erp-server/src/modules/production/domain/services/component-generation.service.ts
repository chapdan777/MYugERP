import { Injectable, Logger } from '@nestjs/common';
import { FormulaEvaluatorService } from '../../../common/services/formula-evaluator.service';
import { OrderItemComponent } from '../entities/order-item-component.entity';

/**
 * Входные данные позиции заказа для генерации компонентов
 */
interface OrderItemData {
    id: number;
    width: number;
    height: number;
    depth?: number;
    properties: Record<string, any>;
}

/**
 * Схема компонента с поддержкой рекурсии и условий
 */
export interface ComponentSchema {
    name: string;
    lengthFormula: string;
    widthFormula: string;
    quantityFormula: string;
    childProductId?: number | null;
    depthFormula?: string | null;
    extraVariables?: Record<string, string> | null;
    conditionFormula?: string | null;
    sortOrder?: number;
}

/**
 * Результат генерации компонента (расширенный, включает childProductId)
 */
export interface GeneratedComponent {
    orderItemComponent: OrderItemComponent;
    childProductId: number | null;
    calculatedLength: number;
    calculatedWidth: number;
    calculatedDepth: number;
    calculatedQuantity: number;
}

@Injectable()
export class ComponentGenerationService {
    private readonly logger = new Logger(ComponentGenerationService.name);

    constructor(
        private readonly formulaEvaluator: FormulaEvaluatorService,
    ) { }

    /**
     * Сгенерировать компоненты для позиции заказа на основе схем
     * @param orderItem Данные позиции заказа (габариты, свойства)
     * @param schemas Схемы компонентов (правила расчета)
     */
    generateComponents(
        orderItem: OrderItemData,
        schemas: ComponentSchema[],
    ): OrderItemComponent[] {
        const results = this.generateComponentsDetailed(orderItem, schemas);
        return results.map(r => r.orderItemComponent);
    }

    /**
     * Сгенерировать компоненты с расширенной информацией (childProductId, размеры)
     * Используется для формирования BOM в заказ-наряде
     */
    generateComponentsDetailed(
        orderItem: OrderItemData,
        schemas: ComponentSchema[],
    ): GeneratedComponent[] {
        const baseContext = this.buildContext(orderItem);
        const results: GeneratedComponent[] = [];

        // Сортируем схемы по sortOrder
        const sortedSchemas = [...schemas].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        // Предварительный проход: собираем ВСЕ extraVariables из всех схем в общий контекст
        const sharedContext: Record<string, number> = { ...baseContext };
        for (const schema of sortedSchemas) {
            if (schema.extraVariables) {
                for (const [key, formula] of Object.entries(schema.extraVariables)) {
                    if (sharedContext[key] !== undefined) continue; // Не перезаписываем уже вычисленные
                    try {
                        sharedContext[key] = this.formulaEvaluator.evaluate(formula, sharedContext);
                    } catch {
                        this.logger.warn(`Не удалось вычислить extraVariable "${key}" = "${formula}"`);
                    }
                }
            }
        }

        this.logger.debug(`Общий контекст формул: ${JSON.stringify(sharedContext)}`);

        for (const schema of sortedSchemas) {
            try {
                // Проверяем условие (если задано)
                if (schema.conditionFormula) {
                    try {
                        const conditionResult = this.formulaEvaluator.evaluate(schema.conditionFormula, sharedContext);
                        if (!conditionResult || conditionResult === 0) {
                            this.logger.debug(`Компонент "${schema.name}" пропущен: условие "${schema.conditionFormula}" = false`);
                            continue;
                        }
                    } catch {
                        this.logger.warn(`Ошибка проверки условия для "${schema.name}", компонент включён по умолчанию`);
                    }
                }

                const length = this.formulaEvaluator.evaluate(schema.lengthFormula, sharedContext);
                const width = this.formulaEvaluator.evaluate(schema.widthFormula, sharedContext);
                const quantity = this.formulaEvaluator.evaluate(schema.quantityFormula, sharedContext);
                const depth = schema.depthFormula
                    ? this.formulaEvaluator.evaluate(schema.depthFormula, sharedContext)
                    : 0;

                if (quantity > 0) {
                    const component = OrderItemComponent.create({
                        orderItemId: orderItem.id,
                        name: schema.name,
                        length,
                        width,
                        quantity,
                        formulaContext: sharedContext,
                    });

                    results.push({
                        orderItemComponent: component,
                        childProductId: schema.childProductId ?? null,
                        calculatedLength: length,
                        calculatedWidth: width,
                        calculatedDepth: depth,
                        calculatedQuantity: quantity,
                    });
                }
            } catch (error: any) {
                this.logger.error(
                    `Не удалось сгенерировать компонент "${schema.name}" для позиции заказа ${orderItem.id}: ${error.message}`,
                );
            }
        }

        return results;
    }

    /**
     * Создать контекст переменных для формул
     * Включает габариты изделия и значения свойств
     */
    private buildContext(orderItem: OrderItemData): Record<string, number> {
        const context: Record<string, number> = {
            H: orderItem.height,
            W: orderItem.width,
            D: orderItem.depth || 0,
        };

        // Добавляем свойства, если они числовые
        for (const [key, value] of Object.entries(orderItem.properties)) {
            if (typeof value === 'number') {
                context[key] = value;
            } else if (!isNaN(Number(value))) {
                context[key] = Number(value);
            }
        }

        return context;
    }
}
