import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('payments')
export class PaymentEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    clientId!: number;

    @Column()
    clientName!: string;

    @Column('decimal', { precision: 12, scale: 2 })
    amount!: number;

    @Column()
    paymentMethod!: string;

    @Column()
    paymentDate!: Date;

    @Column({ type: 'varchar', nullable: true })
    referenceNumber!: string | null;

    @Column({ type: 'text', nullable: true })
    notes!: string | null;

    @Column()
    registeredBy!: number;

    @Column()
    registeredAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
