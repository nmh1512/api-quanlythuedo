import { Module } from '@nestjs/common';
import { RentalCalendarRepository } from './repositories/rental-calendar.repository';
import { CalendarService } from './services/calendar.service';
import { CalendarController } from './controllers/calendar.controller';

@Module({
    controllers: [CalendarController],
    providers: [RentalCalendarRepository, CalendarService],
    exports: [CalendarService, RentalCalendarRepository],
})
export class CalendarModule { }
