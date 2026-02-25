import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OperationCalculationType } from '../../../domain/enums/operation-calculation-type.enum';

/**
 * TypeORM сущность для производственной операции
 */
@Entity('operations')
export class OperationEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 20, unique: true })
    code!: string;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({
        type: 'varchar',
        length: 20,
        default: OperationCalculationType.PER_PIECE,
    })
    calculationType!: OperationCalculationType;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    defaultTimePerUnit!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    defaultRatePerUnit!: number;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
