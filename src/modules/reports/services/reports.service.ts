import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, RentalStatus, Rental } from '@/generated/prisma/client';
import { BaseService } from '@/common/pagination/base.service';
import { RentalRepository } from '@/modules/rentals/repositories/rental.repository';
import { PaginationQueryDto, SortOrder } from '@/common/pagination/dto/pagination-query.dto';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class ReportsService extends BaseService<Rental> {
    constructor(
        private readonly prisma: PrismaService,
        private readonly rentalRepository: RentalRepository
    ) {
        super();
    }

    async getCustomerSalesReport(startDate?: string, endDate?: string) {
        const where: Prisma.RentalWhereInput = {
            status: { not: RentalStatus.cancelled },
            deletedAt: null
        };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const report = await this.prisma.rental.groupBy({
            by: ['customerId'],
            where,
            _sum: { totalPrice: true, deposit: true },
            _count: { id: true },
            orderBy: { _sum: { totalPrice: 'desc' } }
        });

        const customerIds = report.map(r => r.customerId);
        const customers = await this.prisma.customer.findMany({
            where: { id: { in: customerIds } },
            select: { id: true, name: true, phone: true, email: true }
        });

        return report.map(r => {
            const customer = customers.find(c => c.id === r.customerId);
            return {
                customerId: r.customerId,
                customerName: customer?.name || 'Unknown',
                customerPhone: customer?.phone || '',
                totalOrders: r._count?.id || 0,
                totalRevenue: Number(r._sum?.totalPrice || 0)
            };
        });
    }

    async getDailyReport(params: { date?: string, page?: number, limit?: number }) {
        const { date, page = 1, limit = 10 } = params;

        let targetDate: Date;
        if (date) {
            const [year, month, day] = date.split('-').map(Number);
            targetDate = new Date(year, month - 1, day);
        } else {
            targetDate = new Date();
        }

        const start = startOfDay(targetDate);
        const end = endOfDay(targetDate);

        const where: Prisma.RentalWhereInput = {
            status: { not: RentalStatus.cancelled },
            createdAt: { gte: start, lte: end },
            deletedAt: null
        };

        const queryDto = new PaginationQueryDto();
        Object.assign(queryDto, {
            page: Number(page),
            limit: Number(limit),
            sortBy: 'createdAt',
            order: SortOrder.DESC
        });

        const [result, summary] = await Promise.all([
            this.paginate(
                this.rentalRepository,
                queryDto,
                {
                    where,
                    include: {
                        customer: { select: { id: true, name: true, phone: true } },
                        rentalItems: {
                            include: {
                                productItem: {
                                    include: { product: { select: { name: true } } }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                ['id', 'createdAt', 'totalPrice']
            ),
            this.prisma.rental.aggregate({
                where,
                _sum: { totalPrice: true }
            })
        ]);

        (result.meta as any).totalRevenue = Number(summary._sum?.totalPrice || 0);

        return result;
    }




    async getOverviewReport(startDate?: string, endDate?: string) {
        const now = new Date();
        const start = startDate ? startOfDay(new Date(startDate)) : startOfMonth(now);
        const end = endDate ? endOfDay(new Date(endDate)) : endOfMonth(now);

        const rentals = await this.prisma.rental.findMany({
            where: {
                status: { not: RentalStatus.cancelled },
                createdAt: { gte: start, lte: end },
                deletedAt: null
            },
            select: { id: true, totalPrice: true, status: true, createdAt: true },
            orderBy: { createdAt: 'asc' }
        });

        // Group by date
        const grouped: Record<string, { date: string; revenue: number; orders: number }> = {};
        for (const rental of rentals) {
            const dateKey = rental.createdAt.toISOString().slice(0, 10);
            if (!grouped[dateKey]) grouped[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
            grouped[dateKey].revenue += Number(rental.totalPrice);
            grouped[dateKey].orders += 1;
        }

        const totalRevenue = rentals.reduce((sum, r) => sum + Number(r.totalPrice), 0);

        return {
            totalRevenue,
            totalOrders: rentals.length,
            daily: Object.values(grouped)
        };
    }

}
