import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Customer, Prisma } from '@/generated/prisma/client';

@Injectable()
export class CustomerRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: number): Promise<Customer | null> {
        return this.prisma.customer.findUnique({
            where: { id, deletedAt: null },
        });
    }

    async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
        return this.prisma.customer.create({
            data,
        });
    }

    async update(id: number, data: Prisma.CustomerUpdateInput): Promise<Customer> {
        return this.prisma.customer.update({
            where: { id },
            data,
        });
    }

    async search(query?: string): Promise<Customer[]> {
        if (!query) {
            return this.prisma.customer.findMany({
                where: { deletedAt: null },
                take: 20,
            });
        }
        return this.prisma.customer.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { name: { contains: query } },
                    { phone: { contains: query } },
                    { email: { contains: query } },
                ],
            },
            take: 20,
        });
    }
}
