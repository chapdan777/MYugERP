import { PropertyValue } from '../entities/property-value.entity';

export interface IPropertyValueRepository {
  findById(id: number): Promise<PropertyValue | null>;
  findByPropertyId(propertyId: number): Promise<PropertyValue[]>;
  findByPropertyIdAndValue(propertyId: number, value: string): Promise<PropertyValue | null>;
  save(entity: PropertyValue): Promise<PropertyValue>;
  delete(id: number): Promise<void>;
  findAllByPropertyIds(propertyIds: number[]): Promise<PropertyValue[]>;
}