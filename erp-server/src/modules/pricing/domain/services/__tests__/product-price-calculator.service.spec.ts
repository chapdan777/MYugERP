import { ProductPriceCalculatorService } from '../product-price-calculator.service';
import { ModifierType } from '../../enums/modifier-type.enum';

describe('ProductPriceCalculatorService', () => {
  let service: ProductPriceCalculatorService;

  beforeEach(() => {
    service = new ProductPriceCalculatorService();
  });

  describe('calculatePrice', () => {
    it('should calculate price for m2 product with active properties', async () => {
      const result = await service.calculatePrice({
        productId: 1,
        quantity: 10,
        length: 2.0,
        width: 0.8,
        userSelectedProperties: [
          { propertyId: 1, value: 'Вероника' }, // Модель фасада +1000
          { propertyId: 2, value: 'Стандарт с рубашкой 1,5мм' }, // Филенка +500
          { propertyId: 3, value: 'Массив' }, // Материал *1.3
        ],
        coefficient: 1.2,
      });

      // ПРАВИЛЬНЫЙ АЛГОРИТМ:
      // Базовая цена: 1500
      // Единицы измерения (м²): 2.0 × 0.8 = 1.6
      // 
      // Модификаторы применяются к БАЗОВОЙ цене:
      // +1000 (модель Вероника) = 2500
      // +500 (филенка стандарт) = 3000
      // ×1.3 (материал массив) = 3000 × 1.3 = 3900 (цена за 1 м²)
      // 
      // Учет площади: 3900 × 1.6 = 6240 (цена изделия)
      // Коэффициент и количество: 6240 × 1.2 × 10 = 74880

      expect(result.basePrice).toBe(1500);
      expect(result.modifiedUnitPrice).toBe(3900); // Цена за 1 м² после модификаторов
      expect(result.unitPrice).toBe(3900); // Совпадает с modifiedUnitPrice
      expect(result.unitType).toBe('m2');
      expect(result.quantity).toBe(10);
      expect(result.coefficient).toBe(1.2);
      expect(result.modifiersApplied).toHaveLength(3);
      expect(result.finalPrice).toBeCloseTo(74880);
    });

    it('should calculate price for linear meter product', async () => {
      // Модифицируем заглушку для теста
      const originalMethod = (service as any).getProductById;
      (service as any).getProductById = async () => ({
        id: 2,
        name: 'Профиль',
        basePrice: 800,
        unit: 'linear_meter',
        defaultLength: 3.0,
        defaultWidth: 0.1,
        defaultDepth: 0.05,
        properties: [
          {
            propertyId: 1,
            propertyName: 'Цвет',
            isActive: true,
            defaultValue: 'белый',
          },
        ],
      });

      const result = await service.calculatePrice({
        productId: 2,
        quantity: 5,
        length: 3.5, // Переопределяем длину
        userSelectedProperties: [
          { propertyId: 1, value: 'белый' },
        ],
      });

      // Базовая цена: 800
      // Единицы измерения (погонные метры): 3.5
      // Цена за единицу: 800 × 3.5 = 2800
      // Без модификаторов: 2800 × 5 = 14000

      expect(result.basePrice).toBe(800);
      expect(result.modifiedUnitPrice).toBe(800); // Без модификаторов
      expect(result.unitPrice).toBe(800); // Цена за 1 п.м.
      expect(result.unitType).toBe('linear_meter');
      expect(result.quantity).toBe(5);
      expect(result.finalPrice).toBe(14000);

      // Восстанавливаем оригинальный метод
      (service as any).getProductById = originalMethod;
    });

    it('should handle user activated disabled properties', async () => {
      const result = await service.calculatePrice({
        productId: 1,
        quantity: 1,
        userSelectedProperties: [
          { propertyId: 4, value: 'Да' }, // Приклейка декора (была отключена)
        ],
      });

      // Должен добавиться модификатор *1.3 для приклейки декора
      const decorModifier = result.modifiersApplied.find(m => m.code === 'DECOR_ATTACHMENT');
      expect(decorModifier).toBeDefined();
      expect(decorModifier?.modifierType).toBe(ModifierType.MULTIPLIER);
      expect(decorModifier?.value).toBe(1.3);
    });

    it('should calculate with coefficient and default modifiers', async () => {
      const result = await service.calculatePrice({
        productId: 1,
        quantity: 2,
        coefficient: 1.5,
        userSelectedProperties: [],
      });

      // Базовая цена: 1500
      // Модификаторы по умолчанию:
      // +1000 (модель Вероника) = 2500
      // +500 (филенка стандарт) = 3000
      // ×1.3 (материал массив) = 3900 (цена за 1 м²)
      // 
      // С дефолтными размерами: 2.0 × 0.8 = 1.6 м²
      // Цена с площадью: 3900 × 1.6 = 6240
      // С коэффициентом: 6240 × 1.5 = 9360
      // С количеством: 9360 × 2 = 18720

      expect(result.basePrice).toBe(1500);
      expect(result.modifiedUnitPrice).toBe(3900);
      expect(result.coefficient).toBe(1.5);
      expect(result.quantity).toBe(2);
      expect(result.finalPrice).toBe(18720);
    });

    it('should handle default dimensions when not provided', async () => {
      const result = await service.calculatePrice({
        productId: 1,
        quantity: 1,
        userSelectedProperties: [],
      });

      // Должны использоваться дефолтные размеры: 2.0 × 0.8 = 1.6
      expect(result.dimensions.length).toBe(2.0);
      expect(result.dimensions.width).toBe(0.8);
      expect(result.dimensions.depth).toBe(0.018);
      expect(result.modifiedUnitPrice).toBe(3900); // После модификаторов
      expect(result.unitPrice).toBe(3900); // Совпадает
    });
  });

  describe('dimension calculations', () => {
    it('should calculate m2 units correctly', async () => {
      const result = await service.calculatePrice({
        productId: 1,
        quantity: 1,
        length: 2.5,
        width: 1.2,
        userSelectedProperties: [],
      });

      // Площадь: 2.5 × 1.2 = 3.0 м²
      // Цена за 1 м² после модификаторов: 3900
      // Итоговая цена: 3900 × 3.0 = 11700
      expect(result.modifiedUnitPrice).toBe(3900);
      expect(result.unitPrice).toBe(3900);
      expect(result.subtotal).toBe(11700); // Цена с учетом площади
    });

    it('should calculate linear meter units correctly', async () => {
      // Модифицируем заглушку
      const originalMethod = (service as any).getProductById;
      (service as any).getProductById = async () => ({
        id: 3,
        name: 'Профиль',
        basePrice: 500,
        unit: 'linear_meter',
        defaultLength: 2.0,
        defaultWidth: 0.1,
        defaultDepth: 0.05,
        properties: [],
      });

      const result = await service.calculatePrice({
        productId: 3,
        quantity: 1,
        length: 4.0,
        userSelectedProperties: [],
      });

      // Погонные метры: 4.0
      // Цена за 1 п.м. без модификаторов: 500
      // Итоговая цена: 500 × 4.0 = 2000
      expect(result.modifiedUnitPrice).toBe(500);
      expect(result.unitPrice).toBe(500);
      expect(result.subtotal).toBe(2000);

      (service as any).getProductById = originalMethod;
    });

    it('should handle unit type correctly', async () => {
      // Модифицируем заглушку для unit типа
      const originalMethod = (service as any).getProductById;
      (service as any).getProductById = async () => ({
        id: 4,
        name: 'Фурнитура',
        basePrice: 200,
        unit: 'unit',
        defaultLength: 0.1,
        defaultWidth: 0.1,
        defaultDepth: 0.1,
        properties: [],
      });

      const result = await service.calculatePrice({
        productId: 4,
        quantity: 5,
        userSelectedProperties: [],
      });

      // Для unit тип единицы измерения = 1
      // Цена за 1 шт без модификаторов: 200
      // Итоговая цена: 200 × 1 × 5 = 1000
      expect(result.modifiedUnitPrice).toBe(200);
      expect(result.unitPrice).toBe(200);
      expect(result.finalPrice).toBe(1000);

      (service as any).getProductById = originalMethod;
    });
  });

  describe('property handling', () => {
    it('should combine default and user-selected properties', async () => {
      const result = await service.calculatePrice({
        productId: 1,
        quantity: 1,
        userSelectedProperties: [
          { propertyId: 4, value: 'Да' }, // Добавляем отключенное свойство
        ],
      });

      // Должны быть применены все активные свойства:
      // - Дефолтные активные (модель, филенка, материал)
      // - Включенные пользователем (приклейка декора)
      expect(result.modifiersApplied).toHaveLength(4);
    });

    it('should prioritize user values over defaults', async () => {
      const result = await service.calculatePrice({
        productId: 1,
        quantity: 1,
        userSelectedProperties: [
          { propertyId: 1, value: 'Другая модель' }, // Переопределяем дефолт
        ],
      });

      // Проверяем, что используется пользовательское значение
      const modelModifier = result.modifiersApplied.find(m => m.propertyId === 1);
      expect(modelModifier?.propertyValue).toBe('Другая модель');
    });

    it('should apply modifiers in correct order: additive first, then multiplicative', async () => {
      // Создаем специальный тестовый продукт с известными свойствами
      const originalMethod = (service as any).getProductById;
      (service as any).getProductById = async () => ({
        id: 999,
        name: 'Тестовый продукт',
        basePrice: 1000,
        unit: 'm2',
        defaultLength: 1.0,
        defaultWidth: 1.0,
        defaultDepth: 0.018,
        properties: [
          {
            propertyId: 10,
            propertyName: 'Тестовая модель',
            isActive: true,
            defaultValue: 'Базовая',
          },
          {
            propertyId: 20,
            propertyName: 'Тестовый материал',
            isActive: true,
            defaultValue: 'Стандарт',
          }
        ],
      });

      // Также модифицируем getApplicableModifiers для точного контроля
      const originalModifiersMethod = (service as any).getApplicableModifiers;
      (service as any).getApplicableModifiers = async (properties: any[]) => {
        const modifiers: any[] = [];
        
        // Добавляем только те модификаторы, которые нам нужны для теста
        properties.forEach(prop => {
          if (prop.propertyId === 10 && prop.currentValue === 'Премиум') {
            // Аддитивный модификатор: +500
            modifiers.push({
              getId: () => 100,
              getName: () => 'Премиум модель',
              getCode: () => 'PREMIUM_MODEL',
              getModifierType: () => ModifierType.FIXED_AMOUNT,
              getValue: () => 500,
              getPropertyId: () => 10,
              getPropertyValue: () => 'Премиум',
            });
          }
          
          if (prop.propertyId === 20 && prop.currentValue === 'Эксклюзив') {
            // Мультипликативный модификатор: *1.5
            modifiers.push({
              getId: () => 200,
              getName: () => 'Эксклюзивный материал',
              getCode: () => 'EXCLUSIVE_MATERIAL',
              getModifierType: () => ModifierType.MULTIPLIER,
              getValue: () => 1.5,
              getPropertyId: () => 20,
              getPropertyValue: () => 'Эксклюзив',
            });
          }
        });
        
        return modifiers;
      };

      const result = await service.calculatePrice({
        productId: 999,
        quantity: 1,
        length: 1.0,
        width: 1.0,
        userSelectedProperties: [
          { propertyId: 10, value: 'Премиум' },    // +500 (аддитивный)
          { propertyId: 20, value: 'Эксклюзив' },  // *1.5 (мультипликативный)
        ],
        coefficient: 1,
      });

      // Расчет:
      // Базовая цена: 1000
      // Единицы измерения: 1.0 × 1.0 = 1.0
      // 
      // Аддитивные модификаторы (первые):
      // +500 = 1000 + 500 = 1500
      // 
      // Мультипликативные модификаторы (потом):
      // ×1.5 = 1500 × 1.5 = 2250 (цена за 1 м²)
      // 
      // Без коэффициента и количества: 2250

      expect(result.basePrice).toBe(1000);
      expect(result.modifiedUnitPrice).toBe(2250); // Цена за 1 м² после всех модификаторов
      expect(result.unitPrice).toBe(2250); // Совпадает с modifiedUnitPrice
      expect(result.subtotal).toBe(2250); // Цена с площадью (1 м²)
      expect(result.finalPrice).toBe(2250);
      
      // Проверяем, что модификаторы применены в правильном порядке
      const modifiers = result.modifiersApplied;
      expect(modifiers).toHaveLength(2);
      
      // Первый должен быть аддитивный (+500)
      expect(modifiers[0].modifierType).toBe(ModifierType.FIXED_AMOUNT);
      expect(modifiers[0].appliedValue).toBe(500);
      
      // Второй должен быть мультипликативный (*1.5)
      expect(modifiers[1].modifierType).toBe(ModifierType.MULTIPLIER);
      expect(modifiers[1].appliedValue).toBe(1500 * 0.5); // 1500 × (1.5 - 1) = 750
      
      // Восстанавливаем оригинальные методы
      (service as any).getProductById = originalMethod;
      (service as any).getApplicableModifiers = originalModifiersMethod;
    });
  });
});