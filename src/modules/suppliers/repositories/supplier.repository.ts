import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Supplier, Prisma } from '@/generated/prisma/client';

@Injectable()
export class SupplierRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: Prisma.SupplierFindManyArgs = {}): Promise<Supplier[]> {
        return this.prisma.supplier.findMany({
            ...params,
            where: {
                ...params.where,
                deletedAt: null,
            },
        });
    }

    async count(where: Prisma.SupplierWhereInput = {}): Promise<number> {
        return this.prisma.supplier.count({
            where: {
                ...where,
                deletedAt: null,
            },
        });
    }

    async findById(id: number): Promise<Supplier | null> {
        return this.prisma.supplier.findUnique({
            where: { id, deletedAt: null },
        });
    }

    async create(data: Prisma.SupplierCreateInput): Promise<Supplier> {
        return this.prisma.supplier.create({
            data,
        });
    }

    async update(id: number, data: Prisma.SupplierUpdateInput): Promise<Supplier> {
        return this.prisma.supplier.update({
            where: { id },
            data,
        });
    }

    async softDelete(id: number): Promise<Supplier> {
        return this.prisma.supplier.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
