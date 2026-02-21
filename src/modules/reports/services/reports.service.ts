import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, RentalStatus } from '@/generated/prisma/client';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) { }

    async getCustomerSalesReport(startDate?: string, endDate?: string) {
        const where: Prisma.RentalWhereInput = {
            status: { not: RentalStatus.cancelled }
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

    async getDailyReport(params: { date?: string, page?: number, pageSize?: number }) {
        const { date, page = 1, pageSize = 10 } = params;
        const skip = (page - 1) * pageSize;
        const take = Number(pageSize);

        const target = date ? new Date(date) : new Date();
        const start = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 0, 0, 0, 0);
        const end = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59, 59, 999);

        const where: Prisma.RentalWhereInput = {
            status: { not: RentalStatus.cancelled },
            createdAt: { gte: start, lte: end }
        };

        const [data, total, summary] = await Promise.all([
            this.prisma.rental.findMany({
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
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            this.prisma.rental.count({ where }),
            this.prisma.rental.aggregate({
                where,
                _sum: { totalPrice: true }
            })
        ]);

        return {
            data,
            meta: {
                total,
                page: Number(page),
                pageSize: take,
                totalPages: Math.ceil(total / take),
                totalRevenue: Number(summary._sum?.totalPrice || 0)
            }
        };
    }

    async getOverviewReport(startDate?: string, endDate?: string) {
        const now = new Date();
        const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const rentals = await this.prisma.rental.findMany({
            where: {
                status: { not: 'cancelled' },
                createdAt: { gte: start, lte: end }
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
