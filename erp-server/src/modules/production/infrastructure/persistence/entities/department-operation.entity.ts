import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductionDepartmentEntity } from './production-department.entity';
import { OperationEntity } from './operation.entity';

@Entity('department_operations')
export class DepartmentOperationEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'department_id' })
    departmentId!: number;

    @Column({ name: 'operation_id' })
    operationId!: number;

    @Column({ default: 5 })
    priority!: number;

    @Column({ name: 'is_active', default: true })
    isActive!: boolean;



    @ManyToOne(() => ProductionDepartmentEntity, (dept) => dept.operations, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'department_id' })
    department!: ProductionDepartmentEntity;

    @ManyToOne(() => OperationEntity, { eager: true }) // Eager load to always have operation details
    @JoinColumn({ name: 'operation_id' })
    operation!: OperationEntity;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
