import { Module } from '@nestjs/common';
import { PaymentsController } from './presentation/controllers/payments.controller';

@Module({
  imports: [],
  controllers: [PaymentsController],
  providers: [],
})
export class AccountingModule {}