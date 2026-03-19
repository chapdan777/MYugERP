import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RouteStepEntity } from './route-step.entity';

@Entity('technological_routes')
export class TechnologicalRouteEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'product_id', type: 'int', nullable: true })
    productId!: number | null;

    @Column()
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ name: 'is_active', default: true })
    isActive!: boolean;

    @Column({ name: 'is_template', default: false })
    isTemplate!: boolean;

    @OneToMany(() => RouteStepEntity, (step) => step.route, {
        cascade: true,
        eager: true,
    })
    steps!: RouteStepEntity[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
