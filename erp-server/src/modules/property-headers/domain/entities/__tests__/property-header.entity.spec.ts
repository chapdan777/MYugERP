import { PropertyHeader } from '../entities/property-header.entity';
import { DomainException } from '../../../../../common/exceptions/domain.exception';

describe('PropertyHeader Entity', () => {
  describe('create', () => {
    it('should create a new property header with valid data', () => {
      const header = PropertyHeader.create({
        name: 'Тестовая шапка',
        orderTypeId: 1,
        description: 'Тестовое описание',
      });

      expect(header).toBeDefined();
      expect(header.getName()).toBe('Тестовая шапка');
      expect(header.getOrderTypeId()).toBe(1);
      expect(header.getDescription()).toBe('Тестовое описание');
      expect(header.getIsActive()).toBe(true);
    });

    it('should throw error if name is empty', () => {
      expect(() => {
        PropertyHeader.create({
          name: '',
          orderTypeId: 1,
        });
      }).toThrow(DomainException);
    });

    it('should throw error if orderTypeId is invalid', () => {
      expect(() => {
        PropertyHeader.create({
          name: 'Тестовая шапка',
          orderTypeId: 0,
        });
      }).toThrow(DomainException);
    });
  });

  describe('updateInfo', () => {
    it('should update header information', () => {
      const header = PropertyHeader.create({
        name: 'Старое название',
        orderTypeId: 1,
      });

      header.updateInfo({
        name: 'Новое название',
        description: 'Новое описание',
      });

      expect(header.getName()).toBe('Новое название');
      expect(header.getDescription()).toBe('Новое описание');
    });
  });

  describe('activate/deactivate', () => {
    it('should activate inactive header', () => {
      const header = PropertyHeader.create({
        name: 'Тестовая шапка',
        orderTypeId: 1,
      });
      
      // First deactivate
      header.deactivate();
      expect(header.getIsActive()).toBe(false);
      
      // Then activate
      header.activate();
      expect(header.getIsActive()).toBe(true);
    });

    it('should throw error when activating already active header', () => {
      const header = PropertyHeader.create({
        name: 'Тестовая шапка',
        orderTypeId: 1,
      });

      expect(() => header.activate()).toThrow(DomainException);
    });
  });
});