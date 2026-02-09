import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Branch, Prisma } from '@prisma/client';

@Injectable()
export class BranchRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<Branch[]> {
        return this.prisma.branch.findMany({
            where: { deletedAt: null },
        });
    }

    async findById(id: number): Promise<Branch | null> {
        return this.prisma.branch.findUnique({
            where: { id, deletedAt: null },
        });
    }

    async create(data: Prisma.BranchCreateInput): Promise<Branch> {
        return this.prisma.branch.create({ data });
    }

    async update(id: number, data: Prisma.BranchUpdateInput): Promise<Branch> {
        return this.prisma.branch.update({ where: { id }, data });
    }

    async softDelete(id: number): Promise<Branch> {
        return this.prisma.branch.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
