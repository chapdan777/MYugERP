import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * TypeORM Entity для Product (persistence model)
 */
@Entity('products')
@Index(['code'], { unique: true })
@Index(['category'])
@Index(['isActive'])
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 50 })
  category!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice!: number;

  @Column({ type: 'varchar', length: 20 })
  unit!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  defaultLength!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  defaultWidth!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  defaultDepth!: number | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
