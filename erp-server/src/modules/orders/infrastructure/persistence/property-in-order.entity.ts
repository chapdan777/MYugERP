import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';

@Entity('property_in_order')
export class PropertyInOrderEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => OrderItemEntity, orderItem => orderItem.properties)
    orderItem!: OrderItemEntity;

    @Column()
    propertyId!: number;

    @Column()
    propertyCode!: string;

    @Column()
    propertyName!: string;

    @Column()
    value!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;
}
