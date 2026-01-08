import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { OrderTemplateEntity } from './order-template.entity';

@Entity('order_section_templates')
@Index(['templateId'])
@Index(['templateId', 'sectionNumber'], { unique: true })
export class OrderSectionTemplateEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  templateId!: number;

  @Column({ type: 'int' })
  sectionNumber!: number;

  @Column({ type: 'varchar', length: 255 })
  defaultName!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'boolean', default: false })
  isRequired!: boolean;

  @ManyToOne(() => OrderTemplateEntity, template => template.sections)
  @JoinColumn({ name: 'templateId' })
  template!: OrderTemplateEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
