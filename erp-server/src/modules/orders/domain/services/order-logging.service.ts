import { Injectable, Inject } from '@nestjs/common';
import { OrderLog } from '../entities/order-log.entity';
import {
  IOrderLogRepository,
  ORDER_LOG_REPOSITORY,
} from '../repositories/order-log.repository.interface';

export interface LogOrderChangeParams {
  orderId: number;
  userId: number;
  userName: string;
  action: string;
  entityType?: string;
  entityId?: number;
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
  description: string;
}

/**
 * Domain service for logging order changes
 */
@Injectable()
export class OrderLoggingService {
  constructor(
    @Inject(ORDER_LOG_REPOSITORY)
    private readonly logRepository: IOrderLogRepository,
  ) {}

  /**
   * Log a change to an order
   */
  async logChange(params: LogOrderChangeParams): Promise<OrderLog> {
    const log = OrderLog.create({
      orderId: params.orderId,
      userId: params.userId,
      userName: params.userName,
      action: params.action,
      entityType: params.entityType ?? null,
      entityId: params.entityId ?? null,
      fieldName: params.fieldName ?? null,
      oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
      newValue: params.newValue ? JSON.stringify(params.newValue) : null,
      description: params.description,
    });

    return await this.logRepository.save(log);
  }

  /**
   * Get order history
   */
  async getOrderHistory(orderId: number): Promise<OrderLog[]> {
    return await this.logRepository.findByOrderId(orderId);
  }

  /**
   * Get recent changes to an order
   */
  async getRecentChanges(orderId: number, limit: number = 10): Promise<OrderLog[]> {
    return await this.logRepository.findRecent(orderId, limit);
  }
}
