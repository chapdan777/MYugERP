import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { OrderSection } from '../../domain/entities/order-section.entity';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import { MaxSectionsPerOrderRule } from '../../domain/specifications/order-business-rules';

export interface AddSectionToOrderDto {
  orderId: number;
  sectionNumber: number;
  name: string;
  description?: string;
}

/**
 * Use case: Add a section to an existing order
 */
@Injectable()
export class AddSectionToOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(dto: AddSectionToOrderDto): Promise<Order> {
    // 1. Fetch the order
    const order = await this.orderRepository.findById(dto.orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    // 2. Validate business rules
    MaxSectionsPerOrderRule.assertSatisfied(order);

    // 3. Create new section
    const section = OrderSection.create({
      orderId: dto.orderId,
      sectionNumber: dto.sectionNumber,
      name: dto.name,
      description: dto.description ?? null,
    });

    // 4. Add section to order (includes validation)
    order.addSection(section);

    // 5. Save order with new section
    const savedOrder = await this.orderRepository.save(order);

    return savedOrder;
  }
}
