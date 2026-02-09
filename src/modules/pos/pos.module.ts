import { Module } from '@nestjs/common';
import { POSService } from './services/pos.service';
import { POSController } from './controllers/pos.controller';
import { CalendarModule } from '../calendar/calendar.module';
import { PricingModule } from '../pricing/pricing.module';
import { PaymentsModule } from '../payments/payments.module';
import { ProductItemsModule } from '../product-items/product-items.module';
import { RentalsModule } from '../rentals/rentals.module';

@Module({
    imports: [
        CalendarModule,
        PricingModule,
        PaymentsModule,
        ProductItemsModule,
        RentalsModule,
    ],
    controllers: [POSController],
    providers: [POSService],
    exports: [POSService],
})
export class POSModule { }
