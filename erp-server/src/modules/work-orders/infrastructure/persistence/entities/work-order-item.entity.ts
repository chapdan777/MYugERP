import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { WorkOrderEntity } from './work-order.entity';

/**
 * Сущность WorkOrderItem для базы данных
 */
@Entity('work_order_items')
export class WorkOrderItemEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'work_order_id' })
    workOrderId!: number;

    @Column({ name: 'order_item_id' })
    orderItemId!: number;

    @Column({ name: 'product_id' })
    productId!: number;

    @Column({ name: 'product_name' })
    productName!: string;

    @Column({ name: 'operation_id' })
    operationId!: number;

    @Column({ name: 'operation_name' })
    operationName!: string;

    @Column({ type: 'float' })
    quantity!: number;

    @Column({ length: 20 })
    unit!: string;

    @Column({ name: 'estimated_hours', type: 'float' })
    estimatedHours!: number;

    @Column({ name: 'piece_rate', type: 'float' })
    pieceRate!: number;

    @Column({ name: 'actual_hours', type: 'float', nullable: true })
    actualHours!: number | null;

    @Column({ name: 'calculated_materials', type: 'jsonb', nullable: true })
    calculatedMaterials!: any | null;

    @ManyToOne(() => WorkOrderEntity, (workOrder) => workOrder.items, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'work_order_id' })
    workOrder!: WorkOrderEntity;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
