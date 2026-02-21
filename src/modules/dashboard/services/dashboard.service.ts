import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }

    async getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1); // Start of yesterday

        const [
            totalRevenue,
            activeRentals,
            availableItems,
            totalProducts,
            todayRevenue,
            yesterdayRevenue
        ] = await Promise.all([
            this.prisma.rental.aggregate({
                _sum: { totalPrice: true },
                where: { status: { not: 'cancelled' } }
            }),
            this.prisma.rental.count({
                where: { status: { in: ['confirmed', 'renting'] } }
            }),
            this.prisma.productItem.count({
                where: { status: 'available' }
            }),
            this.prisma.product.count({
                where: { deletedAt: null }
            }),
            this.prisma.rental.aggregate({
                _sum: { totalPrice: true },
                where: {
                    status: { not: 'cancelled' },
                    createdAt: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            }),
            this.prisma.rental.aggregate({
                _sum: { totalPrice: true },
                where: {
                    status: { not: 'cancelled' },
                    createdAt: {
                        gte: yesterday,
                        lt: today
                    }
                }
            })
        ]);

        const recentRentals = await this.prisma.rental.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: { select: { name: true } },
                rentalItems: {
                    include: { productItem: { include: { product: { select: { name: true } } } } }
                }
            }
        });

        return {
            totalRevenue: totalRevenue._sum.totalPrice || 0,
            activeRentals,
            availableItems,
            totalProducts,
            todayRevenue: todayRevenue._sum.totalPrice || 0,
            yesterdayRevenue: yesterdayRevenue._sum.totalPrice || 0,
            recentRentals
        };
    }
}
