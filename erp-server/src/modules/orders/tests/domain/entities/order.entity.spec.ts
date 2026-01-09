import { Order } from '../../../domain/entities/order.entity';
import { OrderSection } from '../../../domain/entities/order-section.entity';
import { OrderItem } from '../../../domain/entities/order-item.entity';

describe('Order Entity', () => {
  it('should create a new order', () => {
    const order = Order.create({
      orderNumber: 'TEST-001',
      clientId: 1,
      clientName: 'Test Client',
    });

    expect(order).toBeDefined();
    expect(order.getOrderNumber()).toBe('TEST-001');
  });

  it('should add a section to an order', () => {
    const order = Order.create({
      orderNumber: 'TEST-001',
      clientId: 1,
      clientName: 'Test Client',
    });
    const section = OrderSection.create({
      orderId: order.getId() || 1,
      sectionNumber: 1,
      name: 'Test Section',
    });
    order.addSection(section);

    expect(order.getSections()).toHaveLength(1);
    expect(order.getSections()[0].getName()).toBe('Test Section');
  });

  it('should add an item to a section', () => {
    const order = Order.create({
      orderNumber: 'TEST-001',
      clientId: 1,
      clientName: 'Test Client',
    });
    const section = OrderSection.create({
      orderId: order.getId() || 1,
      sectionNumber: 1,
      name: 'Test Section',
    });
    const item = OrderItem.create({
      orderSectionId: section.getId() || 1,
      productId: 1,
      productName: 'Test Product',
      quantity: 1,
      unit: 1,
      basePrice: 100,
    });
    section.addItem(item);
    order.addSection(section);

    expect(section.getItems()).toHaveLength(1);
    expect(section.getItems()[0].getQuantity()).toBe(1);
  });
});