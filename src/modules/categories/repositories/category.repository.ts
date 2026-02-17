import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Category, Prisma } from '@/generated/prisma/client';

@Injectable()
export class CategoryRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<Category[]> {
        return this.prisma.category.findMany({
            where: { deletedAt: null },
            include: { children: true },
        });
    }

    async findById(id: number): Promise<Category | null> {
        return this.prisma.category.findUnique({
            where: { id, deletedAt: null },
            include: { children: true, parent: true },
        });
    }

    async create(data: Prisma.CategoryCreateInput): Promise<Category> {
        return this.prisma.category.create({ data });
    }

    async update(id: number, data: Prisma.CategoryUpdateInput): Promise<Category> {
        return this.prisma.category.update({ where: { id }, data });
    }

    async softDelete(id: number): Promise<Category> {
        return this.prisma.category.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
