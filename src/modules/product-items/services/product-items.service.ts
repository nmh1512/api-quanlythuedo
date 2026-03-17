import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductItemRepository } from '../repositories/product-item.repository';
import { CreateProductItemDto } from '../dto/create-product-item.dto';
import { UpdateProductItemDto } from '../dto/update-product-item.dto';
import { ProductItem, Prisma, ProductItemStatus, ItemCondition } from '@/generated/prisma/client';
import { BaseService } from '@/common/pagination/base.service';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';
import { PaginatedResponse } from '@/common/pagination/interfaces/paginated-response.interface';

@Injectable()
export class ProductItemsService extends BaseService<ProductItem> {
    constructor(private readonly productItemRepository: ProductItemRepository) {
        super();
    }

    async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<ProductItem>> {
        const { q, status, categoryId, condition } = query;

        const where: Prisma.ProductItemWhereInput = {
            deletedAt: null
        };
        if (q) {
            where.OR = [
                { itemCode: { contains: q, } },
                { product: { name: { contains: q, } } }
            ];
        }

        if (status && status.toLowerCase() !== 'all') {
            where.status = status as ProductItemStatus;
        }

        if (condition && condition.toLowerCase() !== 'all') {
            where.condition = condition as ItemCondition;
        }

        if (categoryId) {
            // Need to handle if OR is already defined
            if (where.OR) {
                // To keep AND with category, it's simpler to combine or use direct path
                (where as any).product = {
                    categoryId: categoryId
                };
            } else {
                where.product = {
                    categoryId: categoryId
                };
            }
        }

        return this.paginate(
            this.productItemRepository,
            query,
            {
                where,
                orderBy: { createdAt: 'desc' }
            },
            ['id', 'itemCode', 'createdAt', 'updatedAt']
        );
    }

    async findOne(id: number) {
        const item = await this.productItemRepository.findById(id);
        if (!item) {
            throw new NotFoundException('Product item not found');
        }
        return item;
    }

    async findByCode(itemCode: string) {
        const item = await this.productItemRepository.findByCode(itemCode);
        if (!item) {
            throw new NotFoundException('Product item not found');
        }
        return item;
    }

    async create(dto: CreateProductItemDto) {
        return this.productItemRepository.create({
            itemCode: dto.itemCode,
            status: dto.status,
            condition: dto.condition,
            price: dto.price,
            note: dto.note,
            product: { connect: { id: dto.productId } },
            branch: { connect: { id: dto.branchId } },
        });
    }

    async update(id: number, dto: UpdateProductItemDto) {
        return this.productItemRepository.update(id, dto);
    }

    async remove(id: number) {
        return this.productItemRepository.softDelete(id);
    }
}
