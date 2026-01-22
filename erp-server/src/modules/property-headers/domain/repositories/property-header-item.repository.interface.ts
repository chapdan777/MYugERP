import { PropertyHeaderItem } from '../entities/property-header-item.entity';

/**
 * Repository interface for PropertyHeaderItem entities
 */
export abstract class IPropertyHeaderItemRepository {
  abstract save(item: PropertyHeaderItem): Promise<PropertyHeaderItem>;
  abstract saveMany(items: PropertyHeaderItem[]): Promise<PropertyHeaderItem[]>;
  abstract findByHeaderId(headerId: number): Promise<PropertyHeaderItem[]>;
  abstract findByHeaderIdAndPropertyId(headerId: number, propertyId: number): Promise<PropertyHeaderItem | null>;
  abstract deleteByHeaderId(headerId: number): Promise<void>;
  abstract deleteByHeaderIdAndPropertyId(headerId: number, propertyId: number): Promise<void>;
}

export const PROPERTY_HEADER_ITEM_REPOSITORY = Symbol('PROPERTY_HEADER_ITEM_REPOSITORY');