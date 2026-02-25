import { PropertyHeaderProduct } from '../../domain/entities/property-header-product.entity';
import { PropertyHeaderProductEntity } from '../persistence/property-header-product.entity';
import { ProductMapper } from '../../../products/infrastructure/persistence/product.mapper';

export class PropertyHeaderProductMapper {
    static toDomain(entity: PropertyHeaderProductEntity): PropertyHeaderProduct {
        return PropertyHeaderProduct.restore({
            headerId: entity.headerId,
            productId: entity.productId,
            createdAt: entity.createdAt,
            product: entity.product ? ProductMapper.toDomain(entity.product) : undefined,
        });
    }

    static toPersistence(domain: PropertyHeaderProduct): PropertyHeaderProductEntity {
        const entity = new PropertyHeaderProductEntity();
        entity.headerId = domain.getHeaderId();
        entity.productId = domain.getProductId();
        entity.createdAt = domain.getCreatedAt();
        return entity;
    }
}
