import { Entity, PrimaryColumn, CreateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { PropertyHeaderEntity } from './property-header.entity';
// Assuming ProductEntity is available in products module, but usually in TypeORM cross-module relations are tricky.
// We can define just the ID columns or use loose coupling.
// Given the requirements, we need at least the persistence mapping.

@Entity('property_header_products')
export class PropertyHeaderProductEntity {
    @PrimaryColumn({ name: 'header_id' })
    headerId!: number;

    @PrimaryColumn({ name: 'product_id' })
    productId!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @ManyToOne(() => PropertyHeaderEntity, (header) => header.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'header_id' })
    header!: PropertyHeaderEntity;
}
