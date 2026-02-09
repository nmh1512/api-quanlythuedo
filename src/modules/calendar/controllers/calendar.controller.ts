import { Controller, Get, Query } from '@nestjs/common';
import { CalendarService } from '../services/calendar.service';

@Controller('calendar')
export class CalendarController {
    constructor(private readonly calendarService: CalendarService) { }

    @Get()
    async getCalendarData(@Query('month') month: string) {
        return this.calendarService.getMonthlyCalendar(month);
    }
}
