import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }

    async getStats() {
        const [
            totalRevenue,
            activeRentals,
            availableItems,
            totalProducts
        ] = await Promise.all([
            this.prisma.rental.aggregate({
                _sum: { totalPrice: true },
                where: { status: { not: 'cancelled' } }
            }),
            this.prisma.rental.count({
                where: { status: 'renting' }
            }),
            this.prisma.productItem.count({
                where: { status: 'available' }
            }),
            this.prisma.product.count({
                where: { deletedAt: null }
            })
        ]);

        const recentRentals = await this.prisma.rental.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true } },
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
            recentRentals
        };
    }
}
