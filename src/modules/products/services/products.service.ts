import { Injectable, NotFoundException } from '@nestjs/common';
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

        const where: Prisma.ProductWhereInput = query.q ? {
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
        } : {};

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
        const images = this.parseImagesFromDto(dto);
        const properties = this.parsePropertiesFromDto(dto);

        if (file) {
            images.push({ url: `/uploads/${file.filename}`, isPrimary: true });
        }

        const productItemsData: Prisma.ProductItemCreateManyProductInput[] = [];

        const quantity = Number(dto.quantity) || 0;
        const branchId = getBranchId();

        if (quantity > 0 && branchId) {
            for (let i = 0; i < quantity; i++) {
                const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
                productItemsData.push({
                    branchId: branchId,
                    itemCode: `ITEM-${Date.now()}-${randomStr}-${i}`,
                    status: 'available',
                });
            }
        }

        return this.productRepository.create({
            name: dto.name,
            description: dto.description,
            basePrice: Number(dto.basePrice),
            category: { connect: { id: Number(dto.categoryId) } },
            productImages: images.length > 0 ? {
                create: images.map(img => ({
                    url: img.url,
                    isPrimary: String(img.isPrimary) === 'true'
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
        const { productImages, properties: propsDto, categoryId, ...data } = dto;
        const updateData: Prisma.ProductUpdateInput = { ...data };

        if (data.basePrice) updateData.basePrice = Number(data.basePrice);

        if (categoryId) {
            updateData.category = { connect: { id: Number(categoryId) } };
        }

        const images = this.parseImagesFromDto(dto);
        if (file) {
            images.push({ url: `/uploads/${file.filename}`, isPrimary: true });
        }

        if (images.length > 0 || dto.productImages) {
            updateData.productImages = {
                deleteMany: {},
                create: images.map(img => ({
                    url: img.url,
                    isPrimary: String(img.isPrimary) === 'true'
                }))
            };
        }

        const properties = this.parsePropertiesFromDto(dto);
        if (properties.length > 0 || propsDto) {
            updateData.properties = {
                set: [], // Disconnect old relations first
                connectOrCreate: properties.map(p => ({
                    where: { name_value: { name: p.name, value: p.value } },
                    create: { name: p.name, value: p.value }
                }))
            };
        }

        return this.productRepository.update(id, updateData);
    }

    private parseImagesFromDto(dto: CreateProductDto | UpdateProductDto): { url: string; isPrimary: boolean }[] {
        if (dto.productImages && Array.isArray(dto.productImages)) {
            return dto.productImages;
        }

        // Handle flat FormData keys like productImages[0][url]
        const images: { url: string; isPrimary: boolean }[] = [];
        const imageKeys = Object.keys(dto).filter(key => key.startsWith('productImages['));

        imageKeys.forEach(key => {
            const indexMatch = key.match(/\[(\d+)\]/);
            const propMatch = key.match(/\]\[(\w+)\]/);

            if (indexMatch && propMatch) {
                const index = parseInt(indexMatch[1]);
                const prop = propMatch[1];

                if (!images[index]) images[index] = { url: '', isPrimary: false };
                const val = (dto as Record<string, any>)[key];
                if (prop === 'url') images[index].url = val;
                if (prop === 'isPrimary') images[index].isPrimary = String(val) === 'true';
            }
        });

        return images.filter(img => img && img.url);
    }

    private parsePropertiesFromDto(dto: CreateProductDto | UpdateProductDto): { name: string; value: string }[] {
        if (dto.properties && Array.isArray(dto.properties)) {
            return dto.properties;
        }

        // Handle flat FormData keys like properties[0][name]
        const properties: { name: string; value: string }[] = [];
        const propertyKeys = Object.keys(dto).filter(key => key.startsWith('properties['));

        propertyKeys.forEach(key => {
            const indexMatch = key.match(/\[(\d+)\]/);
            const propMatch = key.match(/\]\[(\w+)\]/);

            if (indexMatch && propMatch) {
                const index = parseInt(indexMatch[1]);
                const prop = propMatch[1];

                if (!properties[index]) properties[index] = { name: '', value: '' };
                const val = (dto as Record<string, any>)[key];
                if (prop === 'name') properties[index].name = val;
                if (prop === 'value') properties[index].value = val;
            }
        });

        return properties.filter(p => p && p.name && p.value);
    }

    async remove(id: number) {
        return this.productRepository.softDelete(id);
    }

    async getRentalHistory(id: number) {
        return this.productRepository.findRentalHistory(id);
    }
}
