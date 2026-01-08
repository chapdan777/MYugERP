import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { OrderSection } from '../../domain/entities/order-section.entity';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import { IOrderTemplateRepository } from '../../../configuration/domain/repositories/order-template.repository.interface';
import { ORDER_TEMPLATE_REPOSITORY } from '../../../configuration/domain/repositories/injection-tokens';
import { OrderDeadlineMustBeFutureRule } from '../../domain/specifications/order-business-rules';

export interface CreateOrderFromTemplateDto {
  templateId: number;
  clientId: number;
  clientName: string;
  deadline?: Date;
  notes?: string;
}

/**
 * Use case: Create an order from a template
 * Applies the template structure to initialize the order with predefined sections
 */
@Injectable()
export class CreateOrderFromTemplateUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(ORDER_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IOrderTemplateRepository,
  ) {}

  async execute(dto: CreateOrderFromTemplateDto): Promise<Order> {
    // 1. Fetch the template
    const template = await this.templateRepository.findById(dto.templateId);
    if (!template) {
      throw new NotFoundException(`Template with ID ${dto.templateId} not found`);
    }

    if (!template.getIsActive()) {
      throw new NotFoundException(`Template with ID ${dto.templateId} is not active`);
    }

    // 2. Validate deadline if provided
    if (dto.deadline) {
      OrderDeadlineMustBeFutureRule.assertSatisfied(dto.deadline);
    }

    // 3. Generate order number
    const orderNumber = await this.orderRepository.generateOrderNumber();

    // 4. Create the order
    const order = Order.create({
      orderNumber,
      clientId: dto.clientId,
      clientName: dto.clientName,
      deadline: dto.deadline ?? null,
      notes: dto.notes ?? null,
    });

    // 5. Apply template sections to order
    const templateSections = template.getSections();
    
    for (const templateSection of templateSections) {
      const orderSection = OrderSection.create({
        orderId: 0, // Will be set after order is saved
        sectionNumber: templateSection.getSectionNumber(),
        name: templateSection.getDefaultName(),
        description: templateSection.getDescription(),
      });

      order.addSection(orderSection);
    }

    // 6. Save the order (with cascade save for sections)
    const savedOrder = await this.orderRepository.save(order);

    return savedOrder;
  }
}
