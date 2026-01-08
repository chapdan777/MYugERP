import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentRegisteredEvent } from '../../domain/events/payment-registered.event';
import {
  IClientBalanceRepository,
  CLIENT_BALANCE_REPOSITORY,
} from '../../domain/repositories/client-balance.repository.interface';
import { ClientBalance } from '../../domain/entities/client-balance.entity';

/**
 * Event Handler for Payment Events
 * 
 * Automatically updates ClientBalance when payments are registered
 */
@Injectable()
export class PaymentEventsHandler {
  constructor(
    @Inject(CLIENT_BALANCE_REPOSITORY)
    private readonly clientBalanceRepository: IClientBalanceRepository,
  ) {}

  @OnEvent('payment.registered')
  async handlePaymentRegistered(
    event: PaymentRegisteredEvent,
  ): Promise<void> {
    try {
      // Find or create client balance
      let clientBalance = await this.clientBalanceRepository.findByClientId(
        event.clientId,
      );

      if (!clientBalance) {
        // Create new client balance if doesn't exist
        clientBalance = ClientBalance.create({
          clientId: event.clientId,
          clientName: event.clientName,
        });
      }

      // Credit the balance
      clientBalance.credit(event.amount, event.paymentDate);

      // Save updated balance
      await this.clientBalanceRepository.save(clientBalance);

      console.log(
        `[PaymentEventsHandler] Client balance updated for client ${event.clientId}. Amount: ${event.amount}`,
      );
    } catch (error) {
      console.error(
        `[PaymentEventsHandler] Error updating client balance:`,
        error,
      );
      throw error;
    }
  }
}
