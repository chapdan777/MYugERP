import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IWorkOrderRepository, WORK_ORDER_REPOSITORY } from '../repositories/work-order.repository.interface';
import type { IOrderItemComponentRepository } from '../../../production/domain/repositories/order-item-component.repository.interface';
import { ORDER_ITEM_COMPONENT_REPOSITORY } from '../../../production/domain/repositories/order-item-component.repository.interface';
import { CncData, CncItemData } from '../interfaces/cnc-data.interface';

@Injectable()
export class CncDataService {
    constructor(
        @Inject(WORK_ORDER_REPOSITORY)
        private readonly workOrderRepository: IWorkOrderRepository,
        @Inject(ORDER_ITEM_COMPONENT_REPOSITORY)
        private readonly componentRepository: IOrderItemComponentRepository,
    ) { }

    /**
     * Генерирует данные для экспорта в ЧПУ (CNC)
     * @param workOrderId ID заказ-наряда
     * @returns Объект с данными для ЧПУ
     */
    async generateCncData(workOrderId: number): Promise<CncData> {
        const workOrder = await this.workOrderRepository.findById(workOrderId);
        if (!workOrder) {
            throw new NotFoundException(`Заказ-наряд ${workOrderId} не найден`);
        }

        const items: CncItemData[] = [];

        // Перебор позиций заказ-наряда для поиска связанных компонентов
        for (const item of workOrder.getItems()) {
            // Компоненты привязаны к исходной позиции заказа (OrderItem)
            const components = await this.componentRepository.findByOrderItemId(item.getOrderItemId());

            if (components.length > 0) {
                items.push({
                    productName: item.getProductName(),
                    orderItemId: item.getOrderItemId(),
                    quantity: item.getQuantity(),
                    components: components.map(c => ({
                        name: c.getName(),
                        length: c.getLength(),
                        width: c.getWidth(),
                        quantity: c.getQuantity(),
                        quantityTotal: c.getQuantity() * item.getQuantity(),
                        context: c.getFormulaContext()
                    }))
                });
            }
        }

        return {
            workOrderId: workOrder.getId() as number,
            workOrderNumber: workOrder.getWorkOrderNumber(),
            operation: workOrder.getOperationName(),
            createdAt: new Date().toISOString(),
            items
        };
    }
}
