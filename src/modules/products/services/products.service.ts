import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { BaseService } from '@/common/pagination/base.service';
import { Product, Prisma } from '@/generated/prisma/client';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';
import { PaginatedResponse } from '@/common/pagination/interfaces/paginated-response.interface';
import { getBranchId } from '@/common/branch-context';

@Injectable()
export class ProductsService extends BaseService<Product> {
    constructor(private readonly productRepository: ProductRepository) {
        super();
    }

    async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<Product>> {
        const branchId = getBranchId();

        const where: Prisma.ProductWhereInput = {
            deletedAt: null,
            AND: []
        };

        if (query.q) {
            (where.AND as Prisma.ProductWhereInput[]).push({
                OR: [
                    { name: { contains: query.q } },
                    { description: { contains: query.q } },
                    {
                        productItems: {
                            some: {
                                itemCode: { contains: query.q }
                            }
                        }
                    }
                ]
            });
        }

        if (query.status && query.status !== 'all') {
            if (query.status === 'available') {
                (where.AND as Prisma.ProductWhereInput[]).push({
                    productItems: { some: { status: 'available' } }
                });
            } else if (query.status === 'rented') {
                (where.AND as Prisma.ProductWhereInput[]).push({
                    productItems: { every: { status: 'rented' } }
                });
            }
        }

        if (query.categoryId) {
            (where.AND as Prisma.ProductWhereInput[]).push({
                categoryId: query.categoryId,
            });
        }

        return this.paginate(
            this.productRepository,
            query,
            {
                where,
                include: {
                    category: true,
                    productItems: branchId ? {
                        where: {
                            branchId: branchId,
                            deletedAt: null
                        }
                    } : {
                        where: { deletedAt: null }
                    },
                    productImages: true,
                    properties: true,
                }
            },
            ['id', 'name', 'basePrice', 'createdAt', 'updatedAt']
        );
    }

    async findOne(id: number) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return product;
    }

    async create(dto: CreateProductDto, file?: Express.Multer.File) {
        const images = dto.productImages ?? [];
        const properties = dto.properties ?? [];

        if (file) {
            images.push({ url: `/uploads/${file.filename}`, isPrimary: true });
        }

        const variants = dto.variants ?? [];
        const branchId = getBranchId();

        const productItemsData: Prisma.ProductItemCreateManyProductInput[] = [];
        if (variants.length > 0 && branchId) {
            variants.forEach((v, index) => {
                const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
                for (let i = 0; i < v.quantity; i++) {
                    const itemCode = v.itemCode ? `${v.itemCode}-${i}` : `ITEM-${Date.now()}-${randomStr}-${i}`;
                    productItemsData.push({
                        branchId: branchId,
                        itemCode: itemCode,
                        status: v.status || 'available',
                        condition: v.condition || 'NORMAL',
                        price: v.price || 0,
                        note: v.note || ''
                    });
                }
            });
        }

        return this.productRepository.create({
            name: dto.name,
            description: dto.description,
            basePrice: Number(dto.basePrice),
            depositAmount: dto.depositAmount ? Number(dto.depositAmount) : undefined,
            minRentalDays: dto.minRentalDays ? Number(dto.minRentalDays) : undefined,
            maxRentalDays: dto.maxRentalDays ? Number(dto.maxRentalDays) : undefined,
            termsAndConds: dto.termsAndConds,
            category: { connect: { id: Number(dto.categoryId) } },
            productImages: images.length > 0 ? {
                create: images.map(img => ({
                    url: img.url,
                    isPrimary: img.isPrimary ?? false,
                }))
            } : undefined,
            properties: properties.length > 0 ? {
                connectOrCreate: properties.map(p => ({
                    where: { name_value: { name: p.name, value: p.value } },
                    create: { name: p.name, value: p.value }
                }))
            } : undefined,
            productItems: productItemsData.length > 0 ? {
                create: productItemsData
            } : undefined
        });
    }

    async update(id: number, dto: UpdateProductDto, file?: Express.Multer.File) {
        const { productImages, properties, categoryId, ...data } = dto;
        const updateData: Prisma.ProductUpdateInput = { ...data };

        if (data.basePrice) updateData.basePrice = Number(data.basePrice);
        if (data.depositAmount !== undefined) updateData.depositAmount = Number(data.depositAmount) || null;
        if (data.minRentalDays !== undefined) updateData.minRentalDays = Number(data.minRentalDays) || null;
        if (data.maxRentalDays !== undefined) updateData.maxRentalDays = Number(data.maxRentalDays) || null;
        if (data.termsAndConds !== undefined) updateData.termsAndConds = data.termsAndConds;

        if (categoryId) {
            updateData.category = { connect: { id: Number(categoryId) } };
        }

        // productImages và properties đã được parse + validated từ DTO
        const images = productImages ?? [];
        if (file) {
            images.push({ url: `/uploads/${file.filename}`, isPrimary: true });
        }

        if (images.length > 0 || productImages !== undefined) {
            updateData.productImages = {
                deleteMany: {},
                create: images.map(img => ({
                    url: img.url,
                    isPrimary: img.isPrimary ?? false,
                }))
            };
        }

        const props = properties ?? [];
        if (props.length > 0 || properties !== undefined) {
            updateData.properties = {
                set: [],
                connectOrCreate: props.map(p => ({
                    where: { name_value: { name: p.name, value: p.value } },
                    create: { name: p.name, value: p.value }
                }))
            };
        }

        return this.productRepository.update(id, updateData);
    }

    async remove(id: number) {
        const hasRentals = await this.productRepository.hasActiveRentals(id);
        if (hasRentals) {
            throw new BadRequestException('Không thể xóa sản phẩm đang có người thuê');
        }
        return this.productRepository.softDelete(id);
    }

    async getRentalHistory(id: number) {
        return this.productRepository.findRentalHistory(id);
    }
}
