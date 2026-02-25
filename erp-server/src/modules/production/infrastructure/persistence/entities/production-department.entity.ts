import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { DepartmentOperationEntity } from './department-operation.entity';
import { GroupingStrategy } from '../../../domain/entities/production-department.entity';

@Entity('production_departments')
export class ProductionDepartmentEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true, length: 20 })
    code!: string;

    @Column({ length: 100 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({
        name: 'grouping_strategy',
        type: 'enum',
        enum: GroupingStrategy,
        default: GroupingStrategy.BY_ORDER
    })
    groupingStrategy!: GroupingStrategy;

    @Column({ name: 'grouping_property_id', type: 'int', nullable: true })
    groupingPropertyId!: number | null;

    @Column({ name: 'is_active', default: true })
    isActive!: boolean;

    @OneToMany(() => DepartmentOperationEntity, (op) => op.department, {
        cascade: true,
        eager: true,
    })
    operations!: DepartmentOperationEntity[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
