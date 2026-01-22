import { PropertyHeaderItem } from '../entities/property-header-item.entity';
import { DomainException } from '../../../../../common/exceptions/domain.exception';

describe('PropertyHeaderItem Entity', () => {
  describe('create', () => {
    it('should create a new property header item with valid data', () => {
      const item = PropertyHeaderItem.create({
        headerId: 1,
        propertyId: 10,
        value: 'Тестовое значение',
      });

      expect(item).toBeDefined();
      expect(item.getHeaderId()).toBe(1);
      expect(item.getPropertyId()).toBe(10);
      expect(item.getValue()).toBe('Тестовое значение');
    });

    it('should throw error if headerId is invalid', () => {
      expect(() => {
        PropertyHeaderItem.create({
          headerId: 0,
          propertyId: 10,
          value: 'Тестовое значение',
        });
      }).toThrow(DomainException);
    });

    it('should throw error if propertyId is invalid', () => {
      expect(() => {
        PropertyHeaderItem.create({
          headerId: 1,
          propertyId: 0,
          value: 'Тестовое значение',
        });
      }).toThrow(DomainException);
    });

    it('should throw error if value is empty', () => {
      expect(() => {
        PropertyHeaderItem.create({
          headerId: 1,
          propertyId: 10,
          value: '',
        });
      }).toThrow(DomainException);
    });
  });

  describe('updateValue', () => {
    it('should update item value', () => {
      const item = PropertyHeaderItem.create({
        headerId: 1,
        propertyId: 10,
        value: 'Старое значение',
      });

      item.updateValue('Новое значение');
      expect(item.getValue()).toBe('Новое значение');
    });

    it('should throw error when updating with empty value', () => {
      const item = PropertyHeaderItem.create({
        headerId: 1,
        propertyId: 10,
        value: 'Тестовое значение',
      });

      expect(() => item.updateValue('')).toThrow(DomainException);
    });
  });
});