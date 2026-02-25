import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { PropertyInOrderEntity } from './property-in-order.entity';

@Entity('order_items')
export class OrderItemEntity {
  // ... existing code ...

  @OneToMany(() => PropertyInOrderEntity, property => property.orderItem, { cascade: true })
  properties!: PropertyInOrderEntity[];

  // ... existing code ...

  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne('OrderSectionEntity', 'items')
  section!: any;

  @Column()
  productId!: number;

  @Column()
  productName!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  length?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  width?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  depth?: number;

  @Column()
  quantity!: number;

  @Column()
  unit!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  coefficient!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalPrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}