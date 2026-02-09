import { Module } from '@nestjs/common';
import { AvailabilityService } from './services/availability.service';
import { CalendarModule } from '../calendar/calendar.module';
import { ProductItemsModule } from '../product-items/product-items.module';

@Module({
    imports: [CalendarModule, ProductItemsModule],
    providers: [AvailabilityService],
    exports: [AvailabilityService],
})
export class AvailabilityModule { }
