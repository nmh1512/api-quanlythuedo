import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { ProductItem, Prisma } from '@/generated/prisma/client';

@Injectable()
export class ProductItemRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.ProductItemWhereUniqueInput;
        where?: Prisma.ProductItemWhereInput;
        orderBy?: Prisma.ProductItemOrderByWithRelationInput;
    }): Promise<ProductItem[]> {
        return this.prisma.productItem.findMany({
            ...params,
            where: {
                ...params.where,
                deletedAt: null,
            },
            include: {
                product: { include: { productImages: true } },
                branch: true,
            },
        });
    }

    async count(where: Prisma.ProductItemWhereInput = {}): Promise<number> {
        return this.prisma.productItem.count({
            where: {
                ...where,
                deletedAt: null,
            },
        });
    }

    async findById(id: number): Promise<ProductItem | null> {
        return this.prisma.productItem.findUnique({
            where: { id, deletedAt: null },
            include: {
                product: { include: { productImages: true } },
                branch: true,
            },
        });
    }

    async findByCode(itemCode: string): Promise<ProductItem | null> {
        return this.prisma.productItem.findUnique({
            where: { itemCode, deletedAt: null },
            include: {
                product: { include: { productImages: true } },
                branch: true,
            },
        });
    }

    async create(data: Prisma.ProductItemCreateInput): Promise<ProductItem> {
        return this.prisma.productItem.create({
            data,
        });
    }

    async update(id: number, data: Prisma.ProductItemUpdateInput): Promise<ProductItem> {
        return this.prisma.productItem.update({
            where: { id },
            data,
        });
    }

    async softDelete(id: number): Promise<ProductItem> {
        return this.prisma.productItem.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
