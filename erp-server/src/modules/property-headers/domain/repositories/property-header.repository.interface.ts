import { PropertyHeader } from '../entities/property-header.entity';

/**
 * Repository interface for PropertyHeader aggregate
 */
export abstract class IPropertyHeaderRepository {
  abstract save(header: PropertyHeader): Promise<PropertyHeader>;
  abstract findById(id: number): Promise<PropertyHeader | null>;
  abstract findByName(name: string): Promise<PropertyHeader | null>;
  abstract findByOrderTypeId(orderTypeId: number): Promise<PropertyHeader[]>;
  abstract findAll(filters?: {
    isActive?: boolean;
    orderTypeId?: number;
  }): Promise<PropertyHeader[]>;
  abstract delete(id: number): Promise<void>;
  abstract existsByName(name: string, excludeId?: number): Promise<boolean>;
}

export const PROPERTY_HEADER_REPOSITORY = Symbol('PROPERTY_HEADER_REPOSITORY');