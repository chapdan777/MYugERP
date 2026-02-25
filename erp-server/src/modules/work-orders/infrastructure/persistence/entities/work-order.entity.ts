import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WorkOrderStatus } from '../../../domain/enums/work-order-status.enum';
import { WorkOrderItemEntity } from './work-order-item.entity';

/**
 * Сущность WorkOrder для базы данных
 */
@Entity('work_orders')
export class WorkOrderEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'work_order_number', unique: true })
    workOrderNumber!: string;

    @Column({ name: 'order_id' })
    orderId!: number;

    @Column({ name: 'order_number' })
    orderNumber!: string;

    @Column({ name: 'department_id' })
    departmentId!: number;

    @Column({ name: 'department_name' })
    departmentName!: string;

    @Column({ name: 'operation_id' })
    operationId!: number;

    @Column({ name: 'operation_name' })
    operationName!: string;

    @Column({
        type: 'enum',
        enum: WorkOrderStatus,
        default: WorkOrderStatus.PLANNED,
    })
    status!: WorkOrderStatus;

    @Column({ type: 'int' })
    priority!: number;

    @Column({ name: 'priority_override', type: 'int', nullable: true })
    priorityOverride!: number | null;

    @Column({ name: 'priority_override_reason', type: 'text', nullable: true })
    priorityOverrideReason!: string | null;

    @Column({ type: 'timestamp', nullable: true })
    deadline!: Date | null;

    @Column({ name: 'assigned_at', type: 'timestamp', nullable: true })
    assignedAt!: Date | null;

    @Column({ name: 'started_at', type: 'timestamp', nullable: true })
    startedAt!: Date | null;

    @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
    completedAt!: Date | null;

    @Column({ type: 'text', nullable: true })
    notes!: string | null;

    @OneToMany(() => WorkOrderItemEntity, (item: WorkOrderItemEntity) => item.workOrder, {
        cascade: true,
        eager: true,
    })
    items!: WorkOrderItemEntity[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
