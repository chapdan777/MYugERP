import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('order_payment_allocations')
export class OrderPaymentAllocationEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    orderId!: number;

    @Column()
    orderNumber!: string;

    @Column()
    clientId!: number;

    @Column()
    paymentId!: number;

    @Column('decimal', { precision: 12, scale: 2 })
    allocatedAmount!: number;

    @Column()
    allocatedBy!: number;

    @Column()
    allocatedAt!: Date;

    @Column({ type: 'text', nullable: true })
    notes!: string | null;

    @Column({ default: false })
    isCancelled!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
