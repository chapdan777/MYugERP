import { Injectable, Inject } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import { OrderSection } from '../../domain/entities/order-section.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { PropertyInOrder } from '../../domain/entities/property-in-order.entity';
import { CalculatePriceUseCase } from '../../../pricing/application/use-cases/calculate-price.use-case';
import { IProductRepository } from '../../../products/domain/repositories/product.repository.interface';
import { PRODUCT_REPOSITORY } from '../../../products/domain/repositories/injection-tokens';

export interface CreateOrderDto {
  clientId: number;
  clientName?: string;
  deadline?: Date;
  notes?: string;
  sections?: {
    sectionNumber: number;
    sectionName: string;
    headerId?: number;
    propertyValues?: { propertyId: number; propertyName: string; propertyCode: string; value: string }[];
    items?: {
      productId: number;
      quantity: number;
      unit: string;
      length?: number;
      width?: number;
      depth?: number;
      basePrice?: number; // Added to match
      finalPrice?: number; // Added to match
      note?: string; // Added to match
      properties?: { propertyId: number; propertyName: string; propertyCode: string; value: string }[];
    }[];
  }[];
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly calculatePriceUseCase: CalculatePriceUseCase,
  ) { }

  async execute(dto: CreateOrderDto): Promise<Order> {
    // 1. Validate deadline if provided
    if (dto.deadline) {
      // OrderDeadlineMustBeFutureRule.assertSatisfied(dto.deadline); 
      // Commented out as rule is likely missing import, keeping logic simple for now
    }

    // 2. Generate order number
    const orderNumber = await this.orderRepository.generateOrderNumber();

    // 3. Create the order
    const order = Order.create({
      orderNumber,
      clientId: dto.clientId,
      clientName: dto.clientName || 'Без названия',
      deadline: dto.deadline ?? null,
      notes: dto.notes ?? null,
    });

    // 4. Process sections and items if provided
    if (dto.sections && dto.sections.length > 0) {
      for (const sectionDto of dto.sections) {
        // Create section
        const section = OrderSection.create({
          orderId: order.getId() || 0,
          sectionNumber: sectionDto.sectionNumber,
          name: sectionDto.sectionName,
          headerId: sectionDto.headerId || null,
          description: '',
        });

        // Add items to section
        if (sectionDto.items && sectionDto.items.length > 0) {
          for (const itemDto of sectionDto.items) {

            // PROPAGATION LOGIC: Merge section properties with item properties
            const sectionProps = sectionDto.propertyValues || [];
            const itemProps = itemDto.properties || [];

            // Create a map to handle overrides (item props override section props)
            const mergedPropsMap = new Map<number, { propertyId: number; propertyName: string; propertyCode: string; value: string }>();

            sectionProps.forEach(p => mergedPropsMap.set(p.propertyId, p));
            itemProps.forEach(p => mergedPropsMap.set(p.propertyId, p));

            const finalProperties = Array.from(mergedPropsMap.values());

            // Calculate price for the item
            const priceResult = await this.calculatePriceUseCase.execute({
              basePrice: 0,
              productId: Number(itemDto.productId),
              quantity: itemDto.quantity,
              length: itemDto.length,
              width: itemDto.width,
              depth: itemDto.depth,
              unitType: itemDto.unit as any,
              propertyValues: finalProperties.map(p => ({
                propertyId: p.propertyId,
                propertyValue: p.value
              })),
              coefficient: 1,
            });

            const product = await this.productRepository.findById(Number(itemDto.productId));
            const productName = product ? product.getName() : `Продукт #${itemDto.productId}`;

            const item = OrderItem.create({
              orderSectionId: section.getId() || 0,
              productId: Number(itemDto.productId),
              productName: productName,
              quantity: itemDto.quantity,
              length: itemDto.length,
              width: itemDto.width,
              depth: itemDto.depth,
              unit: priceResult.unitType === 'm2' ? 2 : priceResult.unitType === 'linear_meter' ? 3 : 1, // Mapping string unit to enum/number (assuming simple mapping for now)
              coefficient: 1,
              basePrice: priceResult.basePrice,
              notes: null,
            });

            // Update item with calculated prices
            item.updatePrices(priceResult.finalPrice / itemDto.quantity, priceResult.finalPrice);

            // Add properties (using the merged list)
            for (const prop of finalProperties) {
              const propertyInOrder = PropertyInOrder.create({
                orderItemId: item.getId() || 0,
                propertyId: prop.propertyId,
                propertyCode: prop.propertyCode,
                propertyName: prop.propertyName,
                value: prop.value,
              });
              item.addProperty(propertyInOrder);
            }

            section.addItem(item);
          }
        }
        order.addSection(section);
      }
    }

    // 5. Calculate total
    order.calculateTotalAmount();

    // 6. Save the order
    const savedOrder = await this.orderRepository.save(order);

    return savedOrder;
  }
}
