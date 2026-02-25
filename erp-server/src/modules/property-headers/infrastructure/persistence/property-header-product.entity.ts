import { Entity, PrimaryColumn, CreateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { PropertyHeaderEntity } from './property-header.entity';
import { ProductEntity } from '../../../products/infrastructure/persistence/product.entity';

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

    @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product?: ProductEntity;
}
