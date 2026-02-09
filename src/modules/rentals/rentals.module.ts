import { Module } from '@nestjs/common';
import { RentalRepository } from './repositories/rental.repository';
import { RentalsService } from './services/rentals.service';
import { RentalsController } from './controllers/rentals.controller';
import { ProductItemsModule } from '../product-items/product-items.module';
import { CalendarModule } from '../calendar/calendar.module';
import { PricingModule } from '../pricing/pricing.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
    imports: [
        ProductItemsModule,
        CalendarModule,
        PricingModule,
        PaymentsModule,
    ],
    controllers: [RentalsController],
    providers: [RentalRepository, RentalsService],
    exports: [RentalRepository, RentalsService],
})
export class RentalsModule { }
