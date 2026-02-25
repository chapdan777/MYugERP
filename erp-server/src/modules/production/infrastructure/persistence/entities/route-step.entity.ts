import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TechnologicalRouteEntity } from './technological-route.entity';
import { RouteStepMaterialEntity } from './route-step-material.entity';

@Entity('route_steps')
export class RouteStepEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'route_id' })
    routeId!: number;

    @Column({ name: 'operation_id' })
    operationId!: number;

    @Column({ name: 'step_number' })
    stepNumber!: number;

    @Column({ name: 'is_required', default: true })
    isRequired!: boolean;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ name: 'estimated_time', type: 'float', nullable: true })
    estimatedTime!: number | null;

    @ManyToOne(() => TechnologicalRouteEntity, (route) => route.steps, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'route_id' })
    route!: TechnologicalRouteEntity;

    @OneToMany(() => RouteStepMaterialEntity, (material) => material.routeStep, {
        cascade: true,
        eager: true,
    })
    materials!: RouteStepMaterialEntity[];
}
