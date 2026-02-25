import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('work_order_defects')
export class WorkOrderDefectEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    workOrderId!: number;

    @Column('text')
    reason!: string;

    @Column({ nullable: true })
    responsibleUserId!: number;

    @Column({ length: 50, default: 'pending' })
    status!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    resolvedAt!: Date | null;
}
