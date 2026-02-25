import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * OrderItemComponent - Компонент детали заказа
 * Представляет собой часть изделия (филенка, стоевая, царга и т.д.),
 * полученную в результате декомпозиции
 */
export class OrderItemComponent {
    private id?: number;
    private orderItemId: number;
    private name: string;
    private length: number;
    private width: number;
    private quantity: number;
    private formulaContext: string; // JSON

    private constructor(props: {
        id?: number;
        orderItemId: number;
        name: string;
        length: number;
        width: number;
        quantity: number;
        formulaContext: string;
    }) {
        this.id = props.id;
        this.orderItemId = props.orderItemId;
        this.name = props.name;
        this.length = props.length;
        this.width = props.width;
        this.quantity = props.quantity;
        this.formulaContext = props.formulaContext;

        this.validate();
    }

    static create(props: {
        orderItemId: number;
        name: string;
        length: number;
        width: number;
        quantity: number;
        formulaContext: Record<string, any>;
    }): OrderItemComponent {
        return new OrderItemComponent({
            ...props,
            formulaContext: JSON.stringify(props.formulaContext),
        });
    }

    static restore(props: {
        id: number;
        orderItemId: number;
        name: string;
        length: number;
        width: number;
        quantity: number;
        formulaContext: string;
    }): OrderItemComponent {
        return new OrderItemComponent(props);
    }

    private validate(): void {
        if (!this.name) {
            throw new DomainException('Название компонента обязательно');
        }
        if (this.length <= 0 || this.width <= 0) {
            throw new DomainException('Габариты компонента должны быть положительными');
        }
        if (this.quantity <= 0) {
            throw new DomainException('Количество должно быть положительным');
        }
    }

    // Геттеры
    getId(): number | undefined {
        return this.id;
    }

    getOrderItemId(): number {
        return this.orderItemId;
    }

    getName(): string {
        return this.name;
    }

    getLength(): number {
        return this.length;
    }

    getWidth(): number {
        return this.width;
    }

    getQuantity(): number {
        return this.quantity;
    }

    getFormulaContext(): Record<string, any> {
        try {
            return JSON.parse(this.formulaContext);
        } catch {
            return {};
        }
    }
}
