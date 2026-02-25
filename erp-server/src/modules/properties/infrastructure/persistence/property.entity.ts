import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { PropertyValueEntity } from './property-value.entity';

/**
 * TypeORM Entity для Property (persistence model)
 */
@Entity('properties')
@Index(['code'], { unique: true })
@Index(['isActive'])
export class PropertyEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  code!: string;

  @Column({ type: 'varchar', length: 50 })
  dataType!: string;

  @Column({ type: 'text', nullable: true })
  possibleValues!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  defaultValue!: string | null;

  @Column({ type: 'boolean', default: false })
  isRequired!: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  variableName!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => PropertyValueEntity, propertyValue => propertyValue.property)
  values!: PropertyValueEntity[];
}
