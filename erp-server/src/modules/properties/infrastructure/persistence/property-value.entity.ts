import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { PropertyEntity } from './property.entity';
import { PriceModifierEntity } from '../../../pricing/infrastructure/persistence/price-modifier.entity';

@Entity('property_values')
@Index(['propertyId', 'value'], { unique: true })
export class PropertyValueEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'property_id', type: 'int' })
  propertyId!: number;

  @ManyToOne(() => PropertyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property!: PropertyEntity;

  @Column({ type: 'varchar', length: 255 })
  value!: string;

  @Column({ name: 'price_modifier_id', type: 'int', nullable: true })
  priceModifierId!: number | null;

  @ManyToOne(() => PriceModifierEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'price_modifier_id' })
  priceModifier!: PriceModifierEntity | null;

  @Column({ type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', 
           update: true })
  updatedAt!: Date;
}