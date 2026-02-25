import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingController } from './presentation/controllers/accounting.controller';
import { PaymentRegistrationService } from './application/services/payment-registration.service';
import { PaymentAllocationService } from './application/services/payment-allocation.service';

// Entities (Domain - removed from imports)
// import { Payment } from './domain/entities/payment.entity';
// import { ClientBalance } from './domain/entities/client-balance.entity';
// import { OrderPaymentAllocation } from './domain/entities/order-payment-allocation.entity';

// Entities (Persistence)
import { PaymentEntity } from './infrastructure/persistence/entities/payment.entity';
import { ClientBalanceEntity } from './infrastructure/persistence/entities/client-balance.entity';
import { OrderPaymentAllocationEntity } from './infrastructure/persistence/entities/order-payment-allocation.entity';

// Instructions (Tokens)
import { PAYMENT_REPOSITORY } from './domain/repositories/payment.repository.interface';
import { CLIENT_BALANCE_REPOSITORY } from './domain/repositories/client-balance.repository.interface';
import { ORDER_PAYMENT_ALLOCATION_REPOSITORY } from './domain/repositories/order-payment-allocation.repository.interface';

// Repositories (Implementations)
import { PaymentRepository } from './infrastructure/persistence/payment.repository';
import { ClientBalanceRepository } from './infrastructure/persistence/client-balance.repository';
import { OrderPaymentAllocationRepository } from './infrastructure/persistence/order-payment-allocation.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentEntity,
      ClientBalanceEntity,
      OrderPaymentAllocationEntity,
    ]),
  ],
  controllers: [AccountingController],
  providers: [
    PaymentRegistrationService,
    PaymentAllocationService,
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepository,
    },
    {
      provide: CLIENT_BALANCE_REPOSITORY,
      useClass: ClientBalanceRepository,
    },
    {
      provide: ORDER_PAYMENT_ALLOCATION_REPOSITORY,
      useClass: OrderPaymentAllocationRepository,
    },
  ],
  exports: [
    PaymentRegistrationService,
    PaymentAllocationService,
  ],
})
export class AccountingModule { }