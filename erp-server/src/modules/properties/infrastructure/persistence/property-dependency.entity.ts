import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * TypeORM Entity для PropertyDependency (persistence model)
 */
@Entity('property_dependencies')
@Index(['sourcePropertyId'])
@Index(['targetPropertyId'])
@Index(['isActive'])
export class PropertyDependencyEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  sourcePropertyId!: number;

  @Column({ type: 'int' })
  targetPropertyId!: number;

  @Column({ type: 'varchar', length: 50 })
  dependencyType!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sourceValue!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  targetValue!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
