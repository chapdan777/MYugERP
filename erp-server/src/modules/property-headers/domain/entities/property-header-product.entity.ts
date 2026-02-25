import { DomainException } from '../../../../common/exceptions/domain.exception';
import { Product } from '../../../products/domain/entities/product.entity';

/**
 * PropertyHeaderProduct - Сущность связи шапки свойств и продукта
 */
export class PropertyHeaderProduct {
    private headerId: number;
    private productId: number;
    private createdAt: Date;
    private product?: Product;

    private constructor(props: {
        headerId: number;
        productId: number;
        createdAt?: Date;
        product?: Product;
    }) {
        this.headerId = props.headerId;
        this.productId = props.productId;
        this.createdAt = props.createdAt ?? new Date();
        this.product = props.product;

        this.validate();
    }

    static create(props: {
        headerId: number;
        productId: number;
    }): PropertyHeaderProduct {
        return new PropertyHeaderProduct(props);
    }

    static restore(props: {
        headerId: number;
        productId: number;
        createdAt: Date;
        product?: Product;
    }): PropertyHeaderProduct {
        return new PropertyHeaderProduct(props);
    }

    private validate(): void {
        if (!this.headerId || this.headerId <= 0) {
            throw new DomainException('ID шапки должен быть положительным числом');
        }

        if (!this.productId || this.productId <= 0) {
            throw new DomainException('ID продукта должен быть положительным числом');
        }
    }

    getHeaderId(): number {
        return this.headerId;
    }

    getProductId(): number {
        return this.productId;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getProduct(): Product | undefined {
        return this.product;
    }
}
