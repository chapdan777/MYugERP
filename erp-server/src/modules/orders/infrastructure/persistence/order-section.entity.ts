import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_sections')
export class OrderSectionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => OrderEntity, order => order.sections)
  order!: OrderEntity;

  @Column()
  sectionNumber!: number;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany('OrderItemEntity', 'section', { cascade: true })
  items!: any[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}