import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PaymentRegistrationService } from '../../application/services/payment-registration.service';
import { PaymentAllocationService } from '../../application/services/payment-allocation.service';
import {
  RegisterPaymentDto,
  UpdatePaymentNotesDto,
  PaymentResponseDto,
  PaginatedPaymentsResponseDto,
  ClientBalanceResponseDto,
  PaginatedClientBalancesResponseDto,
  AllocatePaymentDto,
  OrderPaymentAllocationResponseDto,
  AllocationResultDto,
  OrderAllocationSummaryDto,
  ClientFinancialSummaryDto,
} from '../dtos/accounting.dto';
import { Inject } from '@nestjs/common';
import {
  IClientBalanceRepository,
  CLIENT_BALANCE_REPOSITORY,
} from '../../domain/repositories/client-balance.repository.interface';

@Controller('accounting')
export class AccountingController {
  constructor(
    private readonly paymentRegistrationService: PaymentRegistrationService,
    private readonly paymentAllocationService: PaymentAllocationService,
    @Inject(CLIENT_BALANCE_REPOSITORY)
    private readonly clientBalanceRepository: IClientBalanceRepository,
  ) { }

  /**
   * Register a new payment
   * POST /accounting/payments
   */
  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  async registerPayment(
    @Body() dto: RegisterPaymentDto,
    @Request() req: any,
  ): Promise<PaymentResponseDto> {
    const userId = req.user?.userId || 1;

    const result = await this.paymentRegistrationService.registerPayment({
      clientId: dto.clientId,
      clientName: dto.clientName,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      paymentDate: new Date(dto.paymentDate),
      referenceNumber: dto.referenceNumber,
      notes: dto.notes,
      registeredBy: userId,
    });

    const payment = await this.paymentRegistrationService.getPaymentById(
      result.paymentId!,
    );

    if (!payment) {
      throw new Error('Payment not found after registration');
    }

    return PaymentResponseDto.fromEntity(payment);
  }

  /**
   * Get payment by ID
   * GET /accounting/payments/:id
   */
  @Get('payments/:id')
  async getPaymentById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRegistrationService.getPaymentById(id);

    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }

    return PaymentResponseDto.fromEntity(payment);
  }

  /**
   * Get all payments by client ID
   * GET /accounting/payments/client/:clientId
   */
  @Get('payments/client/:clientId')
  async getPaymentsByClientId(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<PaymentResponseDto[]> {
    const payments =
      await this.paymentRegistrationService.getPaymentsByClientId(clientId);

    return payments.map((p) => PaymentResponseDto.fromEntity(p));
  }

  /**
   * Get paginated payments by client ID
   * GET /accounting/payments/client/:clientId/paginated?page=1&limit=10
   */
  @Get('payments/client/:clientId/paginated')
  async getPaymentsByClientIdPaginated(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<PaginatedPaymentsResponseDto> {
    const result =
      await this.paymentRegistrationService.getPaymentsByClientIdWithPagination(
        clientId,
        page,
        limit,
      );

    return {
      payments: result.payments.map((p) => PaymentResponseDto.fromEntity(p)),
      total: result.total,
      page,
      limit,
    };
  }

  /**
   * Get payments by date range
   * GET /accounting/payments/date-range?startDate=2024-01-01&endDate=2024-12-31
   */
  @Get('payments/date-range')
  async getPaymentsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<PaymentResponseDto[]> {
    const payments =
      await this.paymentRegistrationService.getPaymentsByDateRange(
        new Date(startDate),
        new Date(endDate),
      );

    return payments.map((p) => PaymentResponseDto.fromEntity(p));
  }

  /**
   * Get payments by client ID and date range
   * GET /accounting/payments/client/:clientId/date-range?startDate=2024-01-01&endDate=2024-12-31
   */
  @Get('payments/client/:clientId/date-range')
  async getPaymentsByClientIdAndDateRange(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<PaymentResponseDto[]> {
    const payments =
      await this.paymentRegistrationService.getPaymentsByClientIdAndDateRange(
        clientId,
        new Date(startDate),
        new Date(endDate),
      );

    return payments.map((p) => PaymentResponseDto.fromEntity(p));
  }

  /**
   * Update payment notes
   * PATCH /accounting/payments/:id/notes
   */
  @Patch('payments/:id/notes')
  async updatePaymentNotes(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentNotesDto,
  ): Promise<{ message: string }> {
    await this.paymentRegistrationService.updatePaymentNotes(id, dto.notes || null);

    return { message: 'Payment notes updated successfully' };
  }

  /**
   * Delete payment
   * DELETE /accounting/payments/:id
   */
  @Delete('payments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePayment(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.paymentRegistrationService.deletePayment(id);
  }

  /**
   * Get client balance by client ID
   * GET /accounting/balance/client/:clientId
   */
  @Get('balance/client/:clientId')
  async getClientBalance(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<ClientBalanceResponseDto> {
    const balance =
      await this.clientBalanceRepository.findByClientId(clientId);

    if (!balance) {
      throw new Error(`Client balance for client ID ${clientId} not found`);
    }

    return ClientBalanceResponseDto.fromEntity(balance);
  }

  /**
   * Get all client balances
   * GET /accounting/balance
   */
  @Get('balance')
  async getAllClientBalances(): Promise<ClientBalanceResponseDto[]> {
    const balances = await this.clientBalanceRepository.findAll();

    return balances.map((b) => ClientBalanceResponseDto.fromEntity(b));
  }

  /**
   * Get paginated client balances
   * GET /accounting/balance/paginated?page=1&limit=10
   */
  @Get('balance/paginated')
  async getClientBalancesPaginated(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<PaginatedClientBalancesResponseDto> {
    const result = await this.clientBalanceRepository.findAllWithPagination(
      page,
      limit,
    );

    return {
      balances: result.balances.map((b) =>
        ClientBalanceResponseDto.fromEntity(b),
      ),
      total: result.total,
      page,
      limit,
    };
  }

  /**
   * Allocate payment to order
   * POST /accounting/allocations
   */
  @Post('allocations')
  @HttpCode(HttpStatus.CREATED)
  async allocatePayment(
    @Body() dto: AllocatePaymentDto,
    @Request() req: any,
  ): Promise<AllocationResultDto> {
    const userId = req.user?.userId || 1;

    const result = await this.paymentAllocationService.allocatePaymentToOrder({
      clientId: dto.clientId,
      clientName: dto.clientName,
      orderId: dto.orderId,
      orderNumber: dto.orderNumber,
      allocatedAmount: dto.allocatedAmount,
      allocatedBy: userId,
      notes: dto.notes,
    });

    return result;
  }

  /**
   * Get allocations for an order
   * GET /accounting/allocations/order/:orderId
   */
  @Get('allocations/order/:orderId')
  async getAllocationsByOrderId(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<OrderPaymentAllocationResponseDto[]> {
    const allocations =
      await this.paymentAllocationService.getAllocationsByOrderId(orderId);

    return allocations.map((a) =>
      OrderPaymentAllocationResponseDto.fromEntity(a),
    );
  }

  /**
   * Get allocations for a client
   * GET /accounting/allocations/client/:clientId
   */
  @Get('allocations/client/:clientId')
  async getAllocationsByClientId(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<OrderPaymentAllocationResponseDto[]> {
    const allocations =
      await this.paymentAllocationService.getAllocationsByClientId(clientId);

    return allocations.map((a) =>
      OrderPaymentAllocationResponseDto.fromEntity(a),
    );
  }

  /**
   * Get allocation summary for an order
   * GET /accounting/allocations/order/:orderId/summary
   */
  @Get('allocations/order/:orderId/summary')
  async getOrderAllocationSummary(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<OrderAllocationSummaryDto> {
    const summary =
      await this.paymentAllocationService.getOrderAllocationSummary(orderId);

    return {
      orderId: summary.orderId,
      orderNumber: summary.orderNumber,
      totalAllocated: summary.totalAllocated,
      allocations: summary.allocations.map((a) =>
        OrderPaymentAllocationResponseDto.fromEntity(a),
      ),
    };
  }

  /**
   * Cancel allocation
   * DELETE /accounting/allocations/:id
   */
  @Delete('allocations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelAllocation(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.paymentAllocationService.cancelAllocation(id);
  }

  /**
   * Get client financial summary (Task 5.12 + 5.13)
   * GET /accounting/clients/:clientId/summary
   */
  @Get('clients/:clientId/summary')
  async getClientFinancialSummary(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Query('paymentsLimit', ParseIntPipe) paymentsLimit: number = 10,
  ): Promise<ClientFinancialSummaryDto> {
    // Get client balance
    const balance =
      await this.clientBalanceRepository.findByClientId(clientId);

    // Get recent payments
    const paymentsResult =
      await this.paymentRegistrationService.getPaymentsByClientIdWithPagination(
        clientId,
        1,
        paymentsLimit,
      );

    // Get active allocations
    const activeAllocations =
      await this.paymentAllocationService.getAllocationsByClientId(clientId);

    // Calculate total allocated
    const totalAllocated = activeAllocations.reduce(
      (sum, a) => sum + a.getAllocatedAmount(),
      0,
    );

    return {
      clientId,
      clientName: balance?.getClientName() || '',
      balance: balance ? ClientBalanceResponseDto.fromEntity(balance) : null,
      recentPayments: paymentsResult.payments.map((p) =>
        PaymentResponseDto.fromEntity(p),
      ),
      activeAllocations: activeAllocations.map((a) =>
        OrderPaymentAllocationResponseDto.fromEntity(a),
      ),
      totalAllocated,
    };
  }
}
