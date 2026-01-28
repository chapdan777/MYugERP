import { PropertyHeaderProduct } from '../../domain/entities/property-header-product.entity';
import { PropertyHeaderProductEntity } from '../persistence/property-header-product.entity';

export class PropertyHeaderProductMapper {
    static toDomain(entity: PropertyHeaderProductEntity): PropertyHeaderProduct {
        return PropertyHeaderProduct.restore({
            headerId: entity.headerId,
            productId: entity.productId,
            createdAt: entity.createdAt,
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
