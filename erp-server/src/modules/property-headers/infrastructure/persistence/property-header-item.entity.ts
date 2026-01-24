import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PropertyHeaderEntity } from './property-header.entity';

@Entity('property_header_items')
export class PropertyHeaderItemEntity {
  @PrimaryColumn()
  headerId!: number;

  @PrimaryColumn()
  propertyId!: number;

  @Column({ type: 'integer', default: 0 })
  sortOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => PropertyHeaderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'headerId' })
  header!: PropertyHeaderEntity;
}