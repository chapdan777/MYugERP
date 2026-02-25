import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderItemComponentRepository } from '../../domain/repositories/order-item-component.repository.interface';
import { OrderItemComponent } from '../../domain/entities/order-item-component.entity';
import { OrderItemComponentEntity } from '../persistence/order-item-component.entity';

@Injectable()
export class OrderItemComponentRepository implements IOrderItemComponentRepository {
    constructor(
        @InjectRepository(OrderItemComponentEntity)
        private readonly repository: Repository<OrderItemComponentEntity>,
    ) { }

    async save(component: OrderItemComponent): Promise<OrderItemComponent> {
        const entity = this.toEntity(component);
        const savedEntity = await this.repository.save(entity);
        return this.toDomain(savedEntity);
    }

    async findByOrderItemId(orderItemId: number): Promise<OrderItemComponent[]> {
        const entities = await this.repository.find({
            where: { orderItemId },
        });
        return entities.map(entity => this.toDomain(entity));
    }

    async deleteByOrderItemId(orderItemId: number): Promise<void> {
        await this.repository.delete({ orderItemId });
    }

    private toEntity(domain: OrderItemComponent): OrderItemComponentEntity {
        const entity = new OrderItemComponentEntity();
        entity.id = domain.getId() as number; // TypeORM handles ID generation if undefined
        entity.orderItemId = domain.getOrderItemId();
        entity.name = domain.getName();
        entity.length = domain.getLength();
        entity.width = domain.getWidth();
        entity.quantity = domain.getQuantity();
        entity.formulaContext = JSON.stringify(domain.getFormulaContext());
        return entity;
    }

    private toDomain(entity: OrderItemComponentEntity): OrderItemComponent {
        return OrderItemComponent.restore({
            id: entity.id,
            orderItemId: entity.orderItemId,
            name: entity.name,
            length: entity.length,
            width: entity.width,
            quantity: entity.quantity,
            formulaContext: entity.formulaContext,
        });
    }
}
