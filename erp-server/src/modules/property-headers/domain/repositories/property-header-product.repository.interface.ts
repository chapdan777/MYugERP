import { PropertyHeaderProduct } from '../entities/property-header-product.entity';

export interface IPropertyHeaderProductRepository {
    save(item: PropertyHeaderProduct): Promise<PropertyHeaderProduct>;
    deleteByHeaderIdAndProductId(headerId: number, productId: number): Promise<void>;
    deleteByProductId(productId: number): Promise<void>;
    findByHeaderId(headerId: number, includeInactive?: boolean): Promise<PropertyHeaderProduct[]>;
    findByProductId(productId: number): Promise<PropertyHeaderProduct[]>;
    findByHeaderIdAndProductId(headerId: number, productId: number): Promise<PropertyHeaderProduct | null>;
    exists(headerId: number, productId: number): Promise<boolean>;
}
