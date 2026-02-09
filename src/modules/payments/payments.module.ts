import { Module } from '@nestjs/common';
import { PaymentRepository } from './repositories/payment.repository';
import { DepositService } from './services/deposit.service';

@Module({
    providers: [PaymentRepository, DepositService],
    exports: [PaymentRepository, DepositService],
})
export class PaymentsModule { }
