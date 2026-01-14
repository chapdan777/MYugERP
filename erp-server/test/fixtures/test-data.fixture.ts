/**
 * Test Data Fixtures for Integration Testing
 * Содержит предопределенные данные для тестирования
 */

import { ModifierType } from '../../src/modules/pricing/domain/enums/modifier-type.enum';
import { OrderStatus } from '../../src/modules/orders/domain/enums/order-status.enum';
import { PaymentStatus } from '../../src/modules/orders/domain/enums/payment-status.enum';

// Тестовые модификаторы цен
export const TEST_PRICE_MODIFIERS = [
  {
    id: 1,
    name: 'Material Premium Surcharge',
    code: 'MAT_PREMIUM',
    modifierType: ModifierType.PERCENTAGE,
    value: 20,
    propertyId: 1,
    propertyValue: 'premium',
    priority: 1,
    isActive: true,
  },
  {
    id: 2,
    name: 'Bulk Order Discount',
    code: 'BULK_DISCOUNT',
    modifierType: ModifierType.PERCENTAGE,
    value: -10,
    propertyId: 2,
    propertyValue: 'bulk',
    priority: 2,
    isActive: true,
  },
  {
    id: 3,
    name: 'Size Surcharge',
    code: 'SIZE_SURCHARGE',
    modifierType: ModifierType.FIXED_AMOUNT,
    value: 500,
    propertyId: 3,
    propertyValue: 'large',
    priority: 3,
    isActive: true,
  },
  {
    id: 4,
    name: 'Seasonal Promotion',
    code: 'SEASONAL_PROMO',
    modifierType: ModifierType.MULTIPLIER,
    value: 0.85,
    propertyId: 4,
    propertyValue: 'winter-sale',
    priority: 1,
    isActive: true,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
];

// Тестовые заказы
export const TEST_ORDERS = [
  {
    id: 1,
    orderNumber: 'TEST-001',
    clientId: 1,
    clientName: 'Test Client Ltd',
    status: OrderStatus.DRAFT,
    paymentStatus: PaymentStatus.UNPAID,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    notes: 'Test order for integration testing',
  },
  {
    id: 2,
    orderNumber: 'TEST-002',
    clientId: 2,
    clientName: 'Another Test Client',
    status: OrderStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PARTIALLY_PAID,
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    notes: 'Confirmed test order',
  },
];

// Тестовые секции заказов
export const TEST_ORDER_SECTIONS = [
  {
    id: 1,
    orderId: 1,
    sectionNumber: 1,
    name: 'Kitchen Facades',
    description: 'Main kitchen cabinet facades',
  },
  {
    id: 2,
    orderId: 1,
    sectionNumber: 2,
    name: 'Kitchen Drawers',
    description: 'Drawer fronts and boxes',
  },
  {
    id: 3,
    orderId: 2,
    sectionNumber: 1,
    name: 'Wardrobe Doors',
    description: 'Bedroom wardrobe doors',
  },
];

// Тестовые позиции заказов
export const TEST_ORDER_ITEMS = [
  {
    id: 1,
    sectionId: 1,
    productId: 101,
    productName: 'Facade Panel',
    quantity: 2,
    unitPrice: 1500,
    totalPrice: 3000,
    properties: JSON.stringify([
      { propertyId: 1, propertyValue: 'premium' },
      { propertyId: 3, propertyValue: 'large' },
    ]),
  },
  {
    id: 2,
    sectionId: 1,
    productId: 102,
    productName: 'Drawer Front',
    quantity: 4,
    unitPrice: 800,
    totalPrice: 3200,
    properties: JSON.stringify([
      { propertyId: 2, propertyValue: 'bulk' },
    ]),
  },
  {
    id: 3,
    sectionId: 2,
    productId: 103,
    productName: 'Drawer Box',
    quantity: 4,
    unitPrice: 600,
    totalPrice: 2400,
    properties: JSON.stringify([]),
  },
];

// Тестовые клиенты
export const TEST_CLIENTS = [
  {
    id: 1,
    name: 'Test Client Ltd',
    email: 'client@test.com',
    phone: '+79991234567',
    address: 'Test Street 123',
  },
  {
    id: 2,
    name: 'Another Test Client',
    email: 'another@test.com',
    phone: '+79997654321',
    address: 'Another Street 456',
  },
];

// Тестовые продукты
export const TEST_PRODUCTS = [
  {
    id: 101,
    name: 'Kitchen Facade Panel',
    basePrice: 1500,
    unit: 'm2',
    defaultLength: 2.0,
    defaultWidth: 0.8,
    defaultDepth: 0.018,
  },
  {
    id: 102,
    name: 'Drawer Front',
    basePrice: 800,
    unit: 'unit',
    defaultLength: 0.6,
    defaultWidth: 0.4,
    defaultDepth: 0.018,
  },
  {
    id: 103,
    name: 'Drawer Box',
    basePrice: 600,
    unit: 'unit',
    defaultLength: 0.6,
    defaultWidth: 0.4,
    defaultDepth: 0.16,
  },
];

// SQL скрипт для создания тестовых данных
export const TEST_DATA_SQL = `
-- Очистка существующих данных
DELETE FROM order_items;
DELETE FROM order_sections;
DELETE FROM orders;
DELETE FROM price_modifiers;
DELETE FROM clients;
DELETE FROM products;

-- Вставка тестовых модификаторов цен
INSERT INTO price_modifiers (id, name, code, modifier_type, value, property_id, property_value, priority, is_active, start_date, end_date, created_at, updated_at) VALUES
(1, 'Material Premium Surcharge', 'MAT_PREMIUM', 'PERCENTAGE', 20, 1, 'premium', 1, true, NULL, NULL, NOW(), NOW()),
(2, 'Bulk Order Discount', 'BULK_DISCOUNT', 'PERCENTAGE', -10, 2, 'bulk', 2, true, NULL, NULL, NOW(), NOW()),
(3, 'Size Surcharge', 'SIZE_SURCHARGE', 'FIXED_AMOUNT', 500, 3, 'large', 3, true, NULL, NULL, NOW(), NOW()),
(4, 'Seasonal Promotion', 'SEASONAL_PROMO', 'MULTIPLIER', 0.85, 4, 'winter-sale', 1, true, NOW() - INTERVAL '7 days', NOW() + INTERVAL '7 days', NOW(), NOW());

-- Вставка тестовых клиентов
INSERT INTO clients (id, name, email, phone, address, created_at, updated_at) VALUES
(1, 'Test Client Ltd', 'client@test.com', '+79991234567', 'Test Street 123', NOW(), NOW()),
(2, 'Another Test Client', 'another@test.com', '+79997654321', 'Another Street 456', NOW(), NOW());

-- Вставка тестовых продуктов
INSERT INTO products (id, name, base_price, unit, default_length, default_width, default_depth, created_at, updated_at) VALUES
(101, 'Kitchen Facade Panel', 1500, 'm2', 2.0, 0.8, 0.018, NOW(), NOW()),
(102, 'Drawer Front', 800, 'unit', 0.6, 0.4, 0.018, NOW(), NOW()),
(103, 'Drawer Box', 600, 'unit', 0.6, 0.4, 0.16, NOW(), NOW());

-- Вставка тестовых заказов
INSERT INTO orders (id, order_number, client_id, client_name, status, payment_status, deadline, notes, created_at, updated_at) VALUES
(1, 'TEST-001', 1, 'Test Client Ltd', 'DRAFT', 'NOT_PAID', NOW() + INTERVAL '30 days', 'Test order for integration testing', NOW(), NOW()),
(2, 'TEST-002', 2, 'Another Test Client', 'CONFIRMED', 'PARTIALLY_PAID', NOW() + INTERVAL '15 days', 'Confirmed test order', NOW(), NOW());

-- Вставка тестовых секций заказов
INSERT INTO order_sections (id, order_id, section_number, name, description, created_at, updated_at) VALUES
(1, 1, 1, 'Kitchen Facades', 'Main kitchen cabinet facades', NOW(), NOW()),
(2, 1, 2, 'Kitchen Drawers', 'Drawer fronts and boxes', NOW(), NOW()),
(3, 2, 1, 'Wardrobe Doors', 'Bedroom wardrobe doors', NOW(), NOW());

-- Вставка тестовых позиций заказов
INSERT INTO order_items (id, section_id, product_id, product_name, quantity, unit_price, total_price, properties, created_at, updated_at) VALUES
(1, 1, 101, 'Facade Panel', 2, 1500, 3000, '[{"propertyId": 1, "propertyValue": "premium"}, {"propertyId": 3, "propertyValue": "large"}]', NOW(), NOW()),
(2, 1, 102, 'Drawer Front', 4, 800, 3200, '[{"propertyId": 2, "propertyValue": "bulk"}]', NOW(), NOW()),
(3, 2, 103, 'Drawer Box', 4, 600, 2400, '[]', NOW(), NOW());
`;

// Функция для получения тестовых данных по типу
export function getTestFixture(type: string) {
  switch (type) {
    case 'priceModifiers':
      return TEST_PRICE_MODIFIERS;
    case 'orders':
      return TEST_ORDERS;
    case 'orderSections':
      return TEST_ORDER_SECTIONS;
    case 'orderItems':
      return TEST_ORDER_ITEMS;
    case 'clients':
      return TEST_CLIENTS;
    case 'products':
      return TEST_PRODUCTS;
    default:
      throw new Error(`Unknown fixture type: ${type}`);
  }
}

// Функция для очистки всех тестовых данных
export function getCleanupSQL(): string {
  return `
    DELETE FROM order_items;
    DELETE FROM order_sections;
    DELETE FROM orders;
    DELETE FROM price_modifiers;
    DELETE FROM clients;
    DELETE FROM products;
  `;
}