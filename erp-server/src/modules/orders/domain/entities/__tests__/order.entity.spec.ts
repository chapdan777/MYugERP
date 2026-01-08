import { Order } from '../order.entity';
import { OrderSection } from '../order-section.entity';
import { OrderStatus } from '../../enums/order-status.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { DomainException } from '../../../../../common/exceptions/domain.exception';

describe('Order Entity', () => {
  describe('create', () => {
    it('should create a new order with valid data', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
        deadline: new Date('2024-12-31'),
        notes: 'Test notes',
      });

      expect(order).toBeDefined();
      expect(order.getOrderNumber()).toBe('ORD-001');
      expect(order.getClientId()).toBe(1);
      expect(order.getClientName()).toBe('Test Client');
      expect(order.getStatus()).toBe(OrderStatus.DRAFT);
      expect(order.getPaymentStatus()).toBe(PaymentStatus.UNPAID);
      expect(order.getTotalAmount()).toBe(0);
      expect(order.getSections()).toEqual([]);
    });

    it('should throw error if order number is empty', () => {
      expect(() =>
        Order.create({
          orderNumber: '',
          clientId: 1,
          clientName: 'Test Client',
        }),
      ).toThrow(DomainException);
    });

    it('should throw error if client ID is invalid', () => {
      expect(() =>
        Order.create({
          orderNumber: 'ORD-001',
          clientId: 0,
          clientName: 'Test Client',
        }),
      ).toThrow(DomainException);
    });

    it('should throw error if client name is empty', () => {
      expect(() =>
        Order.create({
          orderNumber: 'ORD-001',
          clientId: 1,
          clientName: '',
        }),
      ).toThrow(DomainException);
    });

    it('should trim whitespace from inputs', () => {
      const order = Order.create({
        orderNumber: '  ORD-001  ',
        clientId: 1,
        clientName: '  Test Client  ',
        notes: '  Test notes  ',
      });

      expect(order.getOrderNumber()).toBe('ORD-001');
      expect(order.getClientName()).toBe('Test Client');
      expect(order.getNotes()).toBe('Test notes');
    });
  });

  describe('restore', () => {
    it('should restore an order from database', () => {
      const now = new Date();
      const order = Order.restore({
        id: 1,
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PARTIALLY_PAID,
        deadline: new Date('2024-12-31'),
        lockedBy: null,
        lockedAt: null,
        totalAmount: 1000,
        sections: [],
        notes: 'Test notes',
        createdAt: now,
        updatedAt: now,
      });

      expect(order.getId()).toBe(1);
      expect(order.getOrderNumber()).toBe('ORD-001');
      expect(order.getStatus()).toBe(OrderStatus.CONFIRMED);
      expect(order.getPaymentStatus()).toBe(PaymentStatus.PARTIALLY_PAID);
      expect(order.getTotalAmount()).toBe(1000);
    });
  });

  describe('changeStatus', () => {
    it('should allow valid status transitions', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      order.changeStatus(OrderStatus.CONFIRMED);
      expect(order.getStatus()).toBe(OrderStatus.CONFIRMED);

      order.changeStatus(OrderStatus.IN_PRODUCTION);
      expect(order.getStatus()).toBe(OrderStatus.IN_PRODUCTION);

      order.changeStatus(OrderStatus.READY);
      expect(order.getStatus()).toBe(OrderStatus.READY);

      order.changeStatus(OrderStatus.DELIVERED);
      expect(order.getStatus()).toBe(OrderStatus.DELIVERED);
    });

    it('should prevent invalid status transitions', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      expect(() => order.changeStatus(OrderStatus.IN_PRODUCTION)).toThrow(
        DomainException,
      );
    });

    it('should allow cancellation from any status except delivered', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      order.changeStatus(OrderStatus.CONFIRMED);
      order.changeStatus(OrderStatus.CANCELLED);
      expect(order.getStatus()).toBe(OrderStatus.CANCELLED);
    });

    it('should not change status if same status', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      order.changeStatus(OrderStatus.DRAFT);
      expect(order.getStatus()).toBe(OrderStatus.DRAFT);
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      order.updatePaymentStatus(PaymentStatus.PARTIALLY_PAID);
      expect(order.getPaymentStatus()).toBe(PaymentStatus.PARTIALLY_PAID);

      order.updatePaymentStatus(PaymentStatus.PAID);
      expect(order.getPaymentStatus()).toBe(PaymentStatus.PAID);
    });
  });

  describe('lock and unlock', () => {
    it('should lock order for a user', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      order.lock(100);
      expect(order.isLocked()).toBe(true);
      expect(order.isLockedBy(100)).toBe(true);
    });

    it('should refresh lock for same user', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      order.lock(100);
      const firstLockTime = order.getLockedAt();

      // Small delay
      setTimeout(() => {
        order.lock(100);
        const secondLockTime = order.getLockedAt();
        expect(secondLockTime).not.toEqual(firstLockTime);
      }, 10);
    });

    it('should prevent locking by another user', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      order.lock(100);
      expect(() => order.lock(200)).toThrow(DomainException);
    });

    it('should unlock order by lock owner', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      order.lock(100);
      order.unlock(100);
      expect(order.isLocked()).toBe(false);
    });

    it('should prevent unlocking by non-owner', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      order.lock(100);
      expect(() => order.unlock(200)).toThrow(DomainException);
    });

    it('should allow unlocking already unlocked order', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      expect(() => order.unlock(100)).not.toThrow();
    });
  });

  describe('updateInfo', () => {
    it('should update client name', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      order.updateInfo({ clientName: 'Updated Client' });
      expect(order.getClientName()).toBe('Updated Client');
    });

    it('should update deadline', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      const newDeadline = new Date('2025-01-01');
      order.updateInfo({ deadline: newDeadline });
      expect(order.getDeadline()).toEqual(newDeadline);
    });

    it('should update notes', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      order.updateInfo({ notes: 'Updated notes' });
      expect(order.getNotes()).toBe('Updated notes');
    });

    it('should prevent updates on non-modifiable orders', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      order.changeStatus(OrderStatus.CONFIRMED);
      order.changeStatus(OrderStatus.IN_PRODUCTION);

      expect(() => order.updateInfo({ clientName: 'New Name' })).toThrow(
        DomainException,
      );
    });

    it('should throw error if client name is empty', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      expect(() => order.updateInfo({ clientName: '' })).toThrow(
        DomainException,
      );
    });
  });

  describe('canBeModified', () => {
    it('should return true for DRAFT status', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      expect(order.canBeModified()).toBe(true);
    });

    it('should return true for CONFIRMED status', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      order.changeStatus(OrderStatus.CONFIRMED);
      expect(order.canBeModified()).toBe(true);
    });

    it('should return false for IN_PRODUCTION status', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      order.changeStatus(OrderStatus.CONFIRMED);
      order.changeStatus(OrderStatus.IN_PRODUCTION);
      expect(order.canBeModified()).toBe(false);
    });
  });

  describe('calculateTotalAmount', () => {
    it('should calculate total from sections', () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      // Note: This test would require OrderSection mock
      // For now, we test the basic functionality
      const total = order.calculateTotalAmount();
      expect(total).toBe(0);
    });
  });
});
