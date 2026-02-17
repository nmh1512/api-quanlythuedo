import { Injectable } from '@nestjs/common';
import { RentalCalendarRepository } from '../repositories/rental-calendar.repository';
import { CalendarStatus, Prisma } from '@/generated/prisma/client';
import { startOfDay, endOfDay, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class CalendarService {
    constructor(private readonly calendarRepository: RentalCalendarRepository) { }

    async createCalendarEntries(
        productItemIds: number[],
        startDate: Date,
        endDate: Date,
        rentalId: number,
        status: CalendarStatus = CalendarStatus.reserved,
    ) {
        const dates = eachDayOfInterval({
            start: startOfDay(startDate),
            end: startOfDay(endDate),
        });

        const entries: Prisma.RentalCalendarCreateManyInput[] = [];

        for (const productItemId of productItemIds) {
            for (const date of dates) {
                entries.push({
                    productItemId,
                    rentalId,
                    date,
                    status,
                });
            }
        }

        return this.calendarRepository.createMany(entries);
    }

    async removeCalendarEntries(rentalId: number) {
        return this.calendarRepository.softDeleteByRentalId(rentalId);
    }

    async updateCalendarStatus(rentalId: number, status: CalendarStatus) {
        return this.calendarRepository.updateStatusByRentalId(rentalId, status);
    }

    async checkItemAvailability(productItemId: number, startDate: Date, endDate: Date): Promise<boolean> {
        const conflicts = await this.calendarRepository.findByItemAndDateRange(
            productItemId,
            startOfDay(startDate),
            startOfDay(endDate),
        );

        return conflicts.length === 0;
    }

    async getItemCalendar(productItemId: number) {
        return this.calendarRepository.findAll({
            where: { productItemId },
            orderBy: { date: 'asc' },
        });
    }

    async getMonthlyCalendar(month: string) {
        // month format: yyyy-MM
        const date = new Date(`${month}-01`);
        const start = startOfDay(startOfMonth(date));
        const end = endOfDay(endOfMonth(date));

        return this.calendarRepository.findByDateRange(start, end);
    }
}
