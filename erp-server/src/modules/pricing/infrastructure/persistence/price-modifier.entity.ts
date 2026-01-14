import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ModifierType } from '../../domain/enums/modifier-type.enum';

@Entity('price_modifiers')
@Index(['code'])
@Index(['isActive'])
@Index(['propertyId'])
export class PriceModifierEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string;

  @Column({ type: 'enum', enum: ModifierType })
  modifierType!: ModifierType;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  value!: number;

  @Column({ type: 'int', nullable: true })
  propertyId!: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  propertyValue!: string | null;

  @Column({ type: 'text', nullable: true })
  conditionExpression!: string | null;

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  startDate!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endDate!: Date | null;}
