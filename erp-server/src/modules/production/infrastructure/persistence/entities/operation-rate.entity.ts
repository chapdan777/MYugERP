import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('operation_rates')
export class OperationRateEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'operation_id' })
    operationId!: number;

    @Column({ name: 'property_value_id', type: 'int', nullable: true })
    propertyValueId!: number | null;

    @Column({ name: 'rate_per_unit', type: 'decimal', precision: 10, scale: 2 })
    ratePerUnit!: number;

    @Column({ name: 'time_per_unit', type: 'decimal', precision: 10, scale: 2 })
    timePerUnit!: number;

    @Column({ name: 'is_active', default: true })
    isActive!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
