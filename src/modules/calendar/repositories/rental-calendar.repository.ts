import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { RentalCalendar, Prisma, CalendarStatus } from '@prisma/client';

@Injectable()
export class RentalCalendarRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: {
        where?: Prisma.RentalCalendarWhereInput;
        orderBy?: Prisma.RentalCalendarOrderByWithRelationInput;
    }): Promise<RentalCalendar[]> {
        return this.prisma.rentalCalendar.findMany({
            ...params,
            where: {
                ...params.where,
                deletedAt: null,
            },
        });
    }

    async findByItemAndDateRange(
        productItemId: number,
        startDate: Date,
        endDate: Date,
    ): Promise<RentalCalendar[]> {
        return this.prisma.rentalCalendar.findMany({
            where: {
                productItemId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                deletedAt: null,
            },
        });
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<RentalCalendar[]> {
        return this.prisma.rentalCalendar.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                deletedAt: null,
            },
            include: {
                productItem: {
                    include: {
                        product: true,
                    },
                },
                rental: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }

    async createMany(data: Prisma.RentalCalendarCreateManyInput[]): Promise<Prisma.BatchPayload> {
        return this.prisma.rentalCalendar.createMany({
            data,
        });
    }

    async updateStatusByRentalId(rentalId: number, status: CalendarStatus): Promise<Prisma.BatchPayload> {
        return this.prisma.rentalCalendar.updateMany({
            where: { rentalId },
            data: { status },
        });
    }

    async softDeleteByRentalId(rentalId: number): Promise<Prisma.BatchPayload> {
        return this.prisma.rentalCalendar.updateMany({
            where: { rentalId },
            data: { deletedAt: new Date() },
        });
    }

    async deleteEntries(productItemId: number, startDate: Date, endDate: Date): Promise<Prisma.BatchPayload> {
        return this.prisma.rentalCalendar.updateMany({
            where: {
                productItemId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            data: { deletedAt: new Date() },
        });
    }
}
