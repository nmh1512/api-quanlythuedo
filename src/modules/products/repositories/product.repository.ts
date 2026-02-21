import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Product, Prisma } from '@/generated/prisma/client';

@Injectable()
export class ProductRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(
        params: Prisma.ProductFindManyArgs = {}
    ): Promise<Product[]> {
        return this.prisma.product.findMany({
            ...params,
            where: {
                ...params.where,
                deletedAt: null,
            },
        });
    }

    async count(where: Prisma.ProductWhereInput = {}): Promise<number> {
        return this.prisma.product.count({
            where: {
                ...where,
                deletedAt: null,
            },
        });
    }


    async findById(id: number): Promise<Product | null> {
        return this.prisma.product.findUnique({
            where: { id, deletedAt: null },
            include: {
                category: true,
                productImages: true,
                productItems: true,
            },
        });
    }

    async create(data: Prisma.ProductCreateInput): Promise<Product> {
        return this.prisma.product.create({
            data,
        });
    }

    async update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }

    async softDelete(id: number): Promise<Product> {
        return this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async findRentalHistory(productId: number) {
        return this.prisma.rentalItem.findMany({
            where: {
                productItem: {
                    productId: productId
                },
                rental: {
                    deletedAt: null
                }
            },
            include: {
                rental: {
                    include: {
                        customer: true
                    }
                },
                productItem: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
}
