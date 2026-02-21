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

    async findAll(params: Prisma.CustomerFindManyArgs = {}): Promise<Customer[]> {
        return this.prisma.customer.findMany({
            ...params,
            where: {
                ...params.where,
                deletedAt: null
            },
        });
    }

    async count(where: Prisma.CustomerWhereInput = {}): Promise<number> {
        return this.prisma.customer.count({
            where: {
                ...where,
                deletedAt: null
            }
        });
    }
}
