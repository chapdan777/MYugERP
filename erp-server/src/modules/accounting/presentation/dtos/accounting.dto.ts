import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../domain/entities/payment.entity';
import { Payment } from '../../domain/entities/payment.entity';
import { ClientBalance } from '../../domain/entities/client-balance.entity';
import { OrderPaymentAllocation } from '../../domain/entities/order-payment-allocation.entity';

/**
 * DTO for registering a new payment
 */
export class RegisterPaymentDto {
  @IsNumber()
  @Min(1)
  clientId!: number;

  @IsString()
  @IsNotEmpty()
  clientName!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsDateString()
  paymentDate!: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

/**
 * DTO for updating payment notes
 */
export class UpdatePaymentNotesDto {
  @IsOptional()
  @IsString()
  notes?: string | null;
}

/**
 * Response DTO for Payment
 */
export class PaymentResponseDto {
  id!: number | null;
  clientId!: number;
  clientName!: string;
  amount!: number;
  paymentMethod!: PaymentMethod;
  paymentDate!: Date;
  referenceNumber!: string | null;
  notes!: string | null;
  registeredBy!: number;
  registeredAt!: Date;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(payment: Payment): PaymentResponseDto {
    const dto = new PaymentResponseDto();
    dto.id = payment.getId();
    dto.clientId = payment.getClientId();
    dto.clientName = payment.getClientName();
    dto.amount = payment.getAmount();
    dto.paymentMethod = payment.getPaymentMethod();
    dto.paymentDate = payment.getPaymentDate();
    dto.referenceNumber = payment.getReferenceNumber();
    dto.notes = payment.getNotes();
    dto.registeredBy = payment.getRegisteredBy();
    dto.registeredAt = payment.getRegisteredAt();
    dto.createdAt = payment.getCreatedAt();
    dto.updatedAt = payment.getUpdatedAt();
    return dto;
  }
}

/**
 * Response DTO for paginated payments
 */
export class PaginatedPaymentsResponseDto {
  payments!: PaymentResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
}

/**
 * Response DTO for ClientBalance
 */
export class ClientBalanceResponseDto {
  id!: number | null;
  clientId!: number;
  clientName!: string;
  totalPaid!: number;
  totalAllocated!: number;
  balance!: number;
  lastPaymentDate!: Date | null;
  lastAllocationDate!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(clientBalance: ClientBalance): ClientBalanceResponseDto {
    const dto = new ClientBalanceResponseDto();
    dto.id = clientBalance.getId();
    dto.clientId = clientBalance.getClientId();
    dto.clientName = clientBalance.getClientName();
    dto.totalPaid = clientBalance.getTotalPaid();
    dto.totalAllocated = clientBalance.getTotalAllocated();
    dto.balance = clientBalance.getBalance();
    dto.lastPaymentDate = clientBalance.getLastPaymentDate();
    dto.lastAllocationDate = clientBalance.getLastAllocationDate();
    dto.createdAt = clientBalance.getCreatedAt();
    dto.updatedAt = clientBalance.getUpdatedAt();
    return dto;
  }
}

/**
 * Response DTO for paginated client balances
 */
export class PaginatedClientBalancesResponseDto {
  balances!: ClientBalanceResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
}

/**
 * DTO for allocating payment to order
 */
export class AllocatePaymentDto {
  @IsNumber()
  @Min(1)
  clientId!: number;

  @IsString()
  @IsNotEmpty()
  clientName!: string;

  @IsNumber()
  @Min(1)
  orderId!: number;

  @IsString()
  @IsNotEmpty()
  orderNumber!: string;

  @IsNumber()
  @Min(0.01)
  allocatedAmount!: number;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

/**
 * Response DTO for OrderPaymentAllocation
 */
export class OrderPaymentAllocationResponseDto {
  id!: number | null;
  clientId!: number;
  clientName!: string;
  orderId!: number;
  orderNumber!: string;
  allocatedAmount!: number;
  allocationDate!: Date;
  allocatedBy!: number;
  notes!: string | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(
    allocation: OrderPaymentAllocation,
  ): OrderPaymentAllocationResponseDto {
    const dto = new OrderPaymentAllocationResponseDto();
    dto.id = allocation.getId();
    dto.clientId = allocation.getClientId();
    dto.clientName = allocation.getClientName();
    dto.orderId = allocation.getOrderId();
    dto.orderNumber = allocation.getOrderNumber();
    dto.allocatedAmount = allocation.getAllocatedAmount();
    dto.allocationDate = allocation.getAllocationDate();
    dto.allocatedBy = allocation.getAllocatedBy();
    dto.notes = allocation.getNotes();
    dto.isActive = allocation.getIsActive();
    dto.createdAt = allocation.getCreatedAt();
    dto.updatedAt = allocation.getUpdatedAt();
    return dto;
  }
}

/**
 * Response DTO for allocation result
 */
export class AllocationResultDto {
  allocationId!: number | null;
  clientId!: number;
  orderId!: number;
  allocatedAmount!: number;
  remainingBalance!: number;
}

/**
 * Response DTO for order allocation summary
 */
export class OrderAllocationSummaryDto {
  orderId!: number;
  orderNumber!: string;
  totalAllocated!: number;
  allocations!: OrderPaymentAllocationResponseDto[];
}

/**
 * Response DTO for client financial summary (Task 5.12)
 */
export class ClientFinancialSummaryDto {
  clientId!: number;
  clientName!: string;
  balance!: ClientBalanceResponseDto | null;
  recentPayments!: PaymentResponseDto[];
  activeAllocations!: OrderPaymentAllocationResponseDto[];
  totalAllocated!: number;
}
