import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IOrderPaymentAllocationRepository,
  ORDER_PAYMENT_ALLOCATION_REPOSITORY,
} from '../../domain/repositories/order-payment-allocation.repository.interface';
import {
  IClientBalanceRepository,
  CLIENT_BALANCE_REPOSITORY,
} from '../../domain/repositories/client-balance.repository.interface';
import { OrderPaymentAllocation } from '../../domain/entities/order-payment-allocation.entity';
import { PaymentAllocatedEvent } from '../../domain/events/payment-allocated.event';
import { PaymentAllocationCancelledEvent } from '../../domain/events/payment-allocation-cancelled.event';

export interface AllocatePaymentInput {
  clientId: number;
  clientName: string;
  orderId: number;
  orderNumber: string;
  allocatedAmount: number;
  allocatedBy: number;
  notes?: string | null;
}

export interface AllocationResult {
  allocationId: number | null;
  clientId: number;
  orderId: number;
  allocatedAmount: number;
  remainingBalance: number;
}

export interface OrderAllocationSummary {
  orderId: number;
  orderNumber: string;
  totalAllocated: number;
  allocations: OrderPaymentAllocation[];
}

/**
 * Payment Allocation Service
 * 
 * Handles allocation of client balance to orders with validation
 * Tasks 5.8-5.10: Balance allocation, validation, and order payment status updates
 */
@Injectable()
export class PaymentAllocationService {
  constructor(
    @Inject(ORDER_PAYMENT_ALLOCATION_REPOSITORY)
    private readonly allocationRepository: IOrderPaymentAllocationRepository,
    @Inject(CLIENT_BALANCE_REPOSITORY)
    private readonly clientBalanceRepository: IClientBalanceRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Allocate balance to an order
   * Validates sufficient balance before allocation
   */
  async allocatePaymentToOrder(
    input: AllocatePaymentInput,
  ): Promise<AllocationResult> {
    // Get client balance
    const clientBalance = await this.clientBalanceRepository.findByClientId(
      input.clientId,
    );

    if (!clientBalance) {
      throw new Error(
        `Client balance not found for client ID ${input.clientId}`,
      );
    }

    // Validate sufficient balance
    if (!clientBalance.hasAvailableBalance(input.allocatedAmount)) {
      throw new Error(
        `Insufficient balance. Available: ${clientBalance.getBalance()}, Required: ${input.allocatedAmount}`,
      );
    }

    // Debit the balance
    const allocationDate = new Date();
    clientBalance.debit(input.allocatedAmount, allocationDate);

    // Create allocation record
    const allocation = OrderPaymentAllocation.create({
      clientId: input.clientId,
      clientName: input.clientName,
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      allocatedAmount: input.allocatedAmount,
      allocationDate,
      allocatedBy: input.allocatedBy,
      notes: input.notes,
    });

    // Save both
    const savedAllocation = await this.allocationRepository.save(allocation);
    await this.clientBalanceRepository.save(clientBalance);

    // Emit event
    const event = new PaymentAllocatedEvent(
      savedAllocation.getId()!,
      savedAllocation.getClientId(),
      savedAllocation.getOrderId(),
      savedAllocation.getOrderNumber(),
      savedAllocation.getAllocatedAmount(),
      savedAllocation.getAllocationDate(),
      savedAllocation.getAllocatedBy(),
    );
    this.eventEmitter.emit('payment.allocated', event);

    return {
      allocationId: savedAllocation.getId(),
      clientId: savedAllocation.getClientId(),
      orderId: savedAllocation.getOrderId(),
      allocatedAmount: savedAllocation.getAllocatedAmount(),
      remainingBalance: clientBalance.getBalance(),
    };
  }

  /**
   * Allocate balance to multiple orders in batch
   */
  async batchAllocatePayments(
    allocations: AllocatePaymentInput[],
  ): Promise<{
    successfulAllocations: AllocationResult[];
    failedAllocations: { input: AllocatePaymentInput; error: string }[];
  }> {
    const successfulAllocations: AllocationResult[] = [];
    const failedAllocations: { input: AllocatePaymentInput; error: string }[] =
      [];

    for (const allocation of allocations) {
      try {
        const result = await this.allocatePaymentToOrder(allocation);
        successfulAllocations.push(result);
      } catch (error) {
        failedAllocations.push({
          input: allocation,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      successfulAllocations,
      failedAllocations,
    };
  }

  /**
   * Cancel allocation and return balance to client
   */
  async cancelAllocation(allocationId: number): Promise<void> {
    const allocation = await this.allocationRepository.findById(allocationId);

    if (!allocation) {
      throw new Error(`Allocation with ID ${allocationId} not found`);
    }

    if (!allocation.getIsActive()) {
      throw new Error('Allocation is already cancelled');
    }

    // Get client balance
    const clientBalance = await this.clientBalanceRepository.findByClientId(
      allocation.getClientId(),
    );

    if (!clientBalance) {
      throw new Error(
        `Client balance not found for client ID ${allocation.getClientId()}`,
      );
    }

    // Reverse debit (return balance)
    clientBalance.reverseDebit(allocation.getAllocatedAmount());

    // Cancel allocation
    allocation.cancel();

    // Save both
    await this.allocationRepository.save(allocation);
    await this.clientBalanceRepository.save(clientBalance);

    // Emit event
    const event = new PaymentAllocationCancelledEvent(
      allocation.getId()!,
      allocation.getClientId(),
      allocation.getOrderId(),
      allocation.getAllocatedAmount(),
      new Date(),
    );
    this.eventEmitter.emit('payment.allocation.cancelled', event);
  }

  /**
   * Get total allocated amount for an order
   */
  async getTotalAllocatedForOrder(orderId: number): Promise<number> {
    return await this.allocationRepository.getTotalAllocatedForOrder(orderId);
  }

  /**
   * Get allocation summary for an order
   */
  async getOrderAllocationSummary(
    orderId: number,
  ): Promise<OrderAllocationSummary> {
    const allocations =
      await this.allocationRepository.findActiveByOrderId(orderId);

    const totalAllocated = allocations.reduce(
      (sum, a) => sum + a.getAllocatedAmount(),
      0,
    );

    return {
      orderId,
      orderNumber: allocations[0]?.getOrderNumber() || '',
      totalAllocated,
      allocations,
    };
  }

  /**
   * Get all allocations for a client
   */
  async getAllocationsByClientId(
    clientId: number,
  ): Promise<OrderPaymentAllocation[]> {
    return await this.allocationRepository.findActiveByClientId(clientId);
  }

  /**
   * Get all allocations for an order
   */
  async getAllocationsByOrderId(
    orderId: number,
  ): Promise<OrderPaymentAllocation[]> {
    return await this.allocationRepository.findActiveByOrderId(orderId);
  }

  /**
   * Validate if client has sufficient balance for allocation
   */
  async validateSufficientBalance(
    clientId: number,
    requiredAmount: number,
  ): Promise<boolean> {
    const clientBalance =
      await this.clientBalanceRepository.findByClientId(clientId);

    if (!clientBalance) {
      return false;
    }

    return clientBalance.hasAvailableBalance(requiredAmount);
  }
}
