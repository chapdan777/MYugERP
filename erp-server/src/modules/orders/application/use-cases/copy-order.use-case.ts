import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { OrderSection } from '../../domain/entities/order-section.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { PropertyInOrder } from '../../domain/entities/property-in-order.entity';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';

export interface CopyOrderDto {
  sourceOrderId: number;
  newClientId?: number;
  newClientName?: string;
  newDeadline?: Date;
}

/**
 * Use case: Copy an existing order
 * Creates a new order with all sections, items, and properties from the source
 */
@Injectable()
export class CopyOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(dto: CopyOrderDto): Promise<Order> {
    // 1. Fetch the source order
    const sourceOrder = await this.orderRepository.findById(dto.sourceOrderId);
    if (!sourceOrder) {
      throw new NotFoundException(
        `Source order with ID ${dto.sourceOrderId} not found`,
      );
    }

    // 2. Generate new order number
    const newOrderNumber = await this.orderRepository.generateOrderNumber();

    // 3. Create new order with source data or overrides
    const newOrder = Order.create({
      orderNumber: newOrderNumber,
      clientId: dto.newClientId ?? sourceOrder.getClientId(),
      clientName: dto.newClientName ?? sourceOrder.getClientName(),
      deadline: dto.newDeadline ?? sourceOrder.getDeadline(),
      notes: sourceOrder.getNotes(),
    });

    // 4. Copy all sections from source order
    const sourceSections = sourceOrder.getSections();
    for (const sourceSection of sourceSections) {
      // Create new section
      const newSection = OrderSection.create({
        orderId: 0, // Will be set after save
        sectionNumber: sourceSection.getSectionNumber(),
        name: sourceSection.getName(),
        description: sourceSection.getDescription(),
      });

      // Copy all items from source section
      const sourceItems = sourceSection.getItems();
      for (const sourceItem of sourceItems) {
        // Create new item
        const newItem = OrderItem.create({
          orderSectionId: 0, // Will be set after save
          productId: sourceItem.getProductId(),
          productName: sourceItem.getProductName(),
          quantity: sourceItem.getQuantity(),
          unit: sourceItem.getUnit(),
          coefficient: sourceItem.getCoefficient(),
          basePrice: sourceItem.getBasePrice(),
          notes: sourceItem.getNotes(),
        });

        // Copy prices (they will be recalculated if properties change)
        newItem.updatePrices(
          sourceItem.getFinalPrice(),
          sourceItem.getTotalPrice(),
        );

        // Copy all properties from source item
        const sourceProperties = sourceItem.getProperties();
        for (const sourceProp of sourceProperties) {
          const newProp = PropertyInOrder.create({
            orderItemId: 0, // Will be set after save
            propertyId: sourceProp.getPropertyId(),
            propertyCode: sourceProp.getPropertyCode(),
            propertyName: sourceProp.getPropertyName(),
            value: sourceProp.getValue(),
          });
          newItem.addProperty(newProp);
        }

        // Add item to section
        newSection.addItem(newItem);
      }

      // Add section to order
      newOrder.addSection(newSection);
    }

    // 5. Recalculate total amount
    newOrder.calculateTotalAmount();

    // 6. Save the new order
    const savedOrder = await this.orderRepository.save(newOrder);

    return savedOrder;
  }
}
