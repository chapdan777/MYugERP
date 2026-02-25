import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * TypeORM сущность для статуса заказ-наряда
 */
@Entity('work_order_statuses')
export class WorkOrderStatusOrmEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 50, unique: true })
    code!: string;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({ type: 'varchar', length: 7, default: '#808080' })
    color!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder!: number;

    @Column({ name: 'is_initial', type: 'boolean', default: false })
    isInitial!: boolean;

    @Column({ name: 'is_final', type: 'boolean', default: false })
    isFinal!: boolean;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
