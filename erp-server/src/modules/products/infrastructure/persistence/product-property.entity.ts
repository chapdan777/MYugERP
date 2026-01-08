import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * TypeORM Entity для ProductProperty (persistence model)
 */
@Entity('product_properties')
@Index(['productId'])
@Index(['propertyId'])
@Index(['productId', 'propertyId'], { unique: true })
export class ProductPropertyEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  productId!: number;

  @Column({ type: 'int' })
  propertyId!: number;

  @Column({ type: 'boolean', default: false })
  isRequired!: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
