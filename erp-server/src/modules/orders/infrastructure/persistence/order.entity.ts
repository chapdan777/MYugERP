import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  orderNumber!: string;

  @Column()
  clientId!: number;

  @Column()
  clientName!: string;

  @Column()
  status!: string;

  @Column()
  paymentStatus!: string;

  @Column({ type: 'timestamp', nullable: true })
  deadline!: Date | null;

  @Column({ nullable: true })
  lockedBy?: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedAt?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @OneToMany('OrderSectionEntity', 'order', { cascade: true })
  sections!: any[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}