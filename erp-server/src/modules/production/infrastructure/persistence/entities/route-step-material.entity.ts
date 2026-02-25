import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RouteStepEntity } from './route-step.entity';

@Entity('route_step_materials')
export class RouteStepMaterialEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'route_step_id' })
    routeStepId!: number;

    @Column({ name: 'material_id' })
    materialId!: number;

    @Column('text', { name: 'consumption_formula' })
    consumptionFormula!: string;

    @Column({ length: 50, nullable: true })
    unit!: string;

    @ManyToOne(() => RouteStepEntity, (step) => step.materials, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'route_step_id' })
    routeStep!: RouteStepEntity;
}
