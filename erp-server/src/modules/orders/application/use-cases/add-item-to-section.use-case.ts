import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { PropertyInOrder } from '../../domain/entities/property-in-order.entity';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import { MaxItemsPerSectionRule } from '../../domain/specifications/order-item-business-rules';

export interface PropertyValueDto {
  propertyId: number;
  propertyCode: string;
  propertyName: string;
  value: string;
}

export interface AddItemToSectionDto {
  orderId: number;
  sectionNumber: number;
  productId: number;
  productName: string;
  quantity: number;
  unit: number;
  coefficient?: number;
  basePrice: number;
  notes?: string;
  properties?: PropertyValueDto[];
}

/**
 * Use case: Add an item to an order section
 */
@Injectable()
export class AddItemToSectionUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(dto: AddItemToSectionDto): Promise<Order> {
    // 1. Fetch the order
    const order = await this.orderRepository.findById(dto.orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    // 2. Find the section
    const section = order.getSectionByNumber(dto.sectionNumber);
    if (!section) {
      throw new NotFoundException(
        `Section ${dto.sectionNumber} not found in order ${dto.orderId}`,
      );
    }

    // 3. Validate business rules
    MaxItemsPerSectionRule.assertSatisfied(section);

    // 4. Create new item
    const item = OrderItem.create({
      orderSectionId: section.getId() || 0, // Will be set after save
      productId: dto.productId,
      productName: dto.productName,
      quantity: dto.quantity,
      unit: dto.unit,
      coefficient: dto.coefficient,
      basePrice: dto.basePrice,
      notes: dto.notes ?? null,
    });

    // 5. Add properties to item if provided
    if (dto.properties && dto.properties.length > 0) {
      for (const prop of dto.properties) {
        const propertyInOrder = PropertyInOrder.create({
          orderItemId: item.getId() || 0, // Will be set after save
          propertyId: prop.propertyId,
          propertyCode: prop.propertyCode,
          propertyName: prop.propertyName,
          value: prop.value,
        });
        item.addProperty(propertyInOrder);
      }
    }

    // 6. Add item to section
    section.addItem(item);

    // 7. Recalculate order total
    order.calculateTotalAmount();

    // 8. Save order with new item
    const savedOrder = await this.orderRepository.save(order);

    return savedOrder;
  }
}
