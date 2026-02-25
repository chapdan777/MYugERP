import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('client_balances')
export class ClientBalanceEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    clientId!: number;

    @Column()
    clientName!: string;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    totalPaid!: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    totalAllocated!: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    balance!: number;

    @Column({ type: 'timestamp', nullable: true })
    lastPaymentDate!: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    lastAllocationDate!: Date | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
