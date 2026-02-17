import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) { }

    async getCustomerSalesReport(startDate?: string, endDate?: string) {
        const where: any = {
            status: { not: 'cancelled' }
        };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }

        const report = (await (this.prisma.rental as any).groupBy({
            by: ['customerId'],
            where,
            _sum: {
                totalPrice: true,
                deposit: true,
            },
            _count: {
                id: true
            },
            orderBy: {
                _sum: {
                    totalPrice: 'desc'
                }
            }
        })) as any[];

        // Get customer names
        const customerIds = report.map(r => r.customerId);
        const customers = await this.prisma.customer.findMany({
            where: {
                id: { in: customerIds }
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true
            }
        });

        // Map results
        const result = report.map(r => {
            const customer = customers.find(c => c.id === r.customerId);
            return {
                customerId: r.customerId,
                customerName: customer?.name || 'Unknown',
                customerPhone: customer?.phone || '',
                totalOrders: r._count?.id || 0,
                totalRevenue: Number(r._sum?.totalPrice || 0)
            };
        });

        return result;
    }
}
