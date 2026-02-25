import { Injectable, Logger } from '@nestjs/common';
import { FormulaEvaluatorService } from '../../../common/services/formula-evaluator.service';
import { OrderItemComponent } from '../entities/order-item-component.entity';

// Интерфейс для входных данных (OrderItem)
interface OrderItemData {
    id: number;
    width: number;
    height: number;
    depth?: number;
    properties: Record<string, any>; // Значения свойств (variables)
}

// Интерфейс для схемы декомпозиции (правила)
interface ComponentSchema {
    name: string;
    lengthFormula: string;
    widthFormula: string;
    quantityFormula: string;
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
        const context = this.buildContext(orderItem);
        const components: OrderItemComponent[] = [];

        for (const schema of schemas) {
            try {
                const length = this.formulaEvaluator.evaluate(schema.lengthFormula, context);
                const width = this.formulaEvaluator.evaluate(schema.widthFormula, context);
                const quantity = this.formulaEvaluator.evaluate(schema.quantityFormula, context);

                if (quantity > 0) {
                    components.push(
                        OrderItemComponent.create({
                            orderItemId: orderItem.id,
                            name: schema.name,
                            length,
                            width,
                            quantity,
                            formulaContext: context,
                        }),
                    );
                }
            } catch (error: any) {
                this.logger.error(
                    `Не удалось сгенерировать компонент "${schema.name}" для позиции заказа ${orderItem.id}: ${error.message}`,
                );
                // Можно выбрасывать ошибку или пропускать компонент, зависит от бизнес-логики.
                // Пока логируем и пропускаем.
            }
        }

        return components;
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
        // TODO: Нужно убедиться, что свойства мапятся по variableName, а не просто по коду
        // В текущей реализации мы ожидаем, что properties уже содержит ключами variableName
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
