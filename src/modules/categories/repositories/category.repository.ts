import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Category, Prisma } from '@/generated/prisma/client';

@Injectable()
export class CategoryRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: Prisma.CategoryFindManyArgs = {}): Promise<Category[]> {
        return this.prisma.category.findMany({
            ...params,
            where: {
                ...params.where,
                deletedAt: null
            },
            include: {
                ...params.include,
                children: true,
                _count: {
                    select: { products: true }
                }
            },
        });
    }

    async count(where: Prisma.CategoryWhereInput = {}): Promise<number> {
        return this.prisma.category.count({
            where: {
                ...where,
                deletedAt: null
            }
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
