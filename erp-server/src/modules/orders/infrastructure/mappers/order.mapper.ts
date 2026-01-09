import { Order } from '../../domain/entities/order.entity';
import { OrderEntity } from '../persistence/order.entity';
import { OrderSection } from '../../domain/entities/order-section.entity';
import { OrderSectionEntity } from '../persistence/order-section.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderItemEntity } from '../persistence/order-item.entity';

export class OrderMapper {
  static toDomain(entity: OrderEntity): Order {
    return Order.restore({
      id: entity.id,
      orderNumber: entity.orderNumber,
      clientId: entity.clientId,
      clientName: entity.clientName,
      status: entity.status as any,
      paymentStatus: entity.paymentStatus as any,
      deadline: entity.deadline,
      lockedBy: entity.lockedBy || null,
      lockedAt: entity.lockedAt || null,
      totalAmount: entity.totalAmount,
      sections: entity.sections.map(section => OrderSection.restore({
        id: section.id,
        orderId: section.order.id,
        sectionNumber: section.sectionNumber,
        name: section.name,
        description: section.description || null,
        items: section.items.map((item: any) => OrderItem.restore({
          id: item.id,
          orderSectionId: item.section.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          coefficient: item.coefficient,
          basePrice: item.basePrice,
          finalPrice: item.finalPrice,
          totalPrice: item.totalPrice,
          properties: [], // This should be mapped from a real entity if it exists
          notes: item.notes || null,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
      })),
      notes: entity.notes || null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(domain: Order): OrderEntity {
    const entity = new OrderEntity();
    entity.id = domain.getId()!;
    entity.orderNumber = domain.getOrderNumber();
    entity.clientId = domain.getClientId();
    entity.clientName = domain.getClientName();
    entity.status = domain.getStatus();
    entity.paymentStatus = domain.getPaymentStatus();
    entity.deadline = domain.getDeadline();
    entity.lockedBy = domain.getLockedBy() || undefined;
    entity.lockedAt = domain.getLockedAt() || undefined;
    entity.totalAmount = domain.getTotalAmount();
    entity.sections = domain.getSections().map(section => {
      const sectionEntity = new OrderSectionEntity();
      sectionEntity.id = section.getId()!;
      sectionEntity.sectionNumber = section.getSectionNumber();
      sectionEntity.name = section.getName();
      sectionEntity.description = section.getDescription() || undefined;
      sectionEntity.items = section.getItems().map(item => {
        const itemEntity = new OrderItemEntity();
        itemEntity.id = item.getId()!;
        itemEntity.productId = item.getProductId();
        itemEntity.productName = item.getProductName();
        itemEntity.quantity = item.getQuantity();
        itemEntity.unit = item.getUnit();
        itemEntity.coefficient = item.getCoefficient();
        itemEntity.basePrice = item.getBasePrice();
        itemEntity.finalPrice = item.getFinalPrice();
        itemEntity.totalPrice = item.getTotalPrice();
        itemEntity.notes = item.getNotes() || undefined;
        return itemEntity;
      });
      return sectionEntity;
    });
    entity.notes = domain.getNotes() || undefined;
    return entity;
  }
}