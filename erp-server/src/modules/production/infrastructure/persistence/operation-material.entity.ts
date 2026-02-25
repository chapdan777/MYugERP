import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('operation_materials')
export class OperationMaterialEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    operationId!: number;

    @Column()
    materialId!: number;

    @Column('text')
    consumptionFormula!: string;

    @Column({ length: 50 })
    unit!: string;
}
