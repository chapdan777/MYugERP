import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../domain/repositories/payment.repository.interface';
import { Payment, PaymentMethod } from '../../domain/entities/payment.entity';
import { PaymentRegisteredEvent } from '../../domain/events/payment-registered.event';

export interface RegisterPaymentInput {
  clientId: number;
  clientName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  referenceNumber?: string | null;
  notes?: string | null;
  registeredBy: number;
}

export interface PaymentRegistrationResult {
  paymentId: number | null;
  clientId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  referenceNumber: string | null;
}

@Injectable()
export class PaymentRegistrationService {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async registerPayment(
    input: RegisterPaymentInput,
  ): Promise<PaymentRegistrationResult> {
    // Validate reference number uniqueness if provided
    if (input.referenceNumber) {
      const existingPayment = await this.paymentRepository.findByReferenceNumber(
        input.referenceNumber,
      );
      if (existingPayment) {
        throw new Error(
          `Payment with reference number ${input.referenceNumber} already exists`,
        );
      }
    }

    // Create payment entity
    const payment = Payment.create({
      clientId: input.clientId,
      clientName: input.clientName,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      paymentDate: input.paymentDate,
      referenceNumber: input.referenceNumber,
      notes: input.notes,
      registeredBy: input.registeredBy,
    });

    // Save payment
    const savedPayment = await this.paymentRepository.save(payment);

    // Emit domain event
    const event = new PaymentRegisteredEvent(
      savedPayment.getId()!,
      savedPayment.getClientId(),
      savedPayment.getClientName(),
      savedPayment.getAmount(),
      savedPayment.getPaymentMethod(),
      savedPayment.getPaymentDate(),
      savedPayment.getRegisteredBy(),
      savedPayment.getRegisteredAt(),
    );
    this.eventEmitter.emit('payment.registered', event);

    return {
      paymentId: savedPayment.getId(),
      clientId: savedPayment.getClientId(),
      amount: savedPayment.getAmount(),
      paymentMethod: savedPayment.getPaymentMethod(),
      paymentDate: savedPayment.getPaymentDate(),
      referenceNumber: savedPayment.getReferenceNumber(),
    };
  }

  async getPaymentById(paymentId: number): Promise<Payment | null> {
    return await this.paymentRepository.findById(paymentId);
  }

  async getPaymentsByClientId(clientId: number): Promise<Payment[]> {
    return await this.paymentRepository.findByClientId(clientId);
  }

  async getPaymentsByClientIdWithPagination(
    clientId: number,
    page: number,
    limit: number,
  ): Promise<{ payments: Payment[]; total: number }> {
    return await this.paymentRepository.findByClientIdWithPagination(
      clientId,
      page,
      limit,
    );
  }

  async getPaymentsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Payment[]> {
    return await this.paymentRepository.findByDateRange(startDate, endDate);
  }

  async getPaymentsByClientIdAndDateRange(
    clientId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Payment[]> {
    return await this.paymentRepository.findByClientIdAndDateRange(
      clientId,
      startDate,
      endDate,
    );
  }

  async updatePaymentNotes(
    paymentId: number,
    notes: string | null,
  ): Promise<void> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`);
    }

    payment.updateNotes(notes);
    await this.paymentRepository.save(payment);
  }

  async deletePayment(paymentId: number): Promise<void> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`);
    }

    // Business rule: Only allow deletion of payments that haven't been allocated
    // This will be enforced when we implement OrderPaymentAllocation
    
    await this.paymentRepository.delete(paymentId);
  }
}
