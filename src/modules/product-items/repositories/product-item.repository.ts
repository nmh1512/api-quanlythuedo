import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { ProductItem, Prisma } from '@/generated/prisma/client';
import { getBranchId } from '@/common/branch-context';

@Injectable()
export class ProductItemRepository {
    constructor(private readonly prisma: PrismaService) { }

    private get branchWhere(): Prisma.ProductItemWhereInput {
        const branchId = getBranchId();
        return branchId ? { branchId } : {};
    }

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
                ...this.branchWhere,
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
                ...this.branchWhere,
                deletedAt: null,
            },
        });
    }

    async findById(id: number): Promise<ProductItem | null> {
        return this.prisma.productItem.findFirst({
            where: {
                id,
                ...this.branchWhere,
                deletedAt: null
            },
            include: {
                product: { include: { productImages: true } },
                branch: true,
            },
        });
    }

    async findByCode(itemCode: string): Promise<ProductItem | null> {
        return this.prisma.productItem.findFirst({
            where: {
                itemCode,
                ...this.branchWhere,
                deletedAt: null
            },
            include: {
                product: { include: { productImages: true } },
                branch: true,
            },
        });
    }

    async create(data: Prisma.ProductItemCreateInput): Promise<ProductItem> {
        const branchId = getBranchId();
        const createData = { ...data };

        // Nếu data chưa có branch (vì createInput là object lồng nhau phức tạp), 
        // ta cần đảm bảo branch được nối đúng.
        if (branchId && !createData.branch) {
            createData.branch = { connect: { id: branchId } };
        }

        return this.prisma.productItem.create({
            data: createData,
        });
    }

    async update(id: number, data: Prisma.ProductItemUpdateInput): Promise<ProductItem> {
        await this.prisma.productItem.updateMany({
            where: {
                id,
                ...this.branchWhere
            },
            data,
        });
        const updated = await this.findById(id);
        if (!updated) throw new Error('ProductItem not found or access denied');
        return updated;
    }

    async softDelete(id: number): Promise<ProductItem> {
        await this.prisma.productItem.updateMany({
            where: {
                id,
                ...this.branchWhere
            },
            data: { deletedAt: new Date() },
        });
        const deleted = await this.prisma.productItem.findFirst({ where: { id } });
        if (!deleted) throw new Error('ProductItem not found');
        return deleted;
    }
}
