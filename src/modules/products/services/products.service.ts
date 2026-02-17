import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private readonly productRepository: ProductRepository) { }

    async findAll(q?: string) {
        return this.productRepository.findAll({
            where: q ? {
                OR: [
                    { name: { contains: q } },
                    { description: { contains: q } },
                    {
                        productItems: {
                            some: {
                                itemCode: { contains: q }
                            }
                        }
                    }
                ]
            } : {},
            include: {
                category: true,
                productItems: true,
                productImages: true,
            }
        });
    }

    async findOne(id: number) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return product;
    }

    async create(dto: any, file?: any) {
        const images = this.parseImagesFromDto(dto);

        if (file) {
            images.push({ url: `/uploads/${file.filename}`, isPrimary: true });
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
        });
    }

    async update(id: number, dto: any, file?: any) {
        const { productImages, categoryId, ...data } = dto;
        const updateData: any = { ...data };

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

        return this.productRepository.update(id, updateData);
    }

    private parseImagesFromDto(dto: any): any[] {
        if (dto.productImages && Array.isArray(dto.productImages)) {
            return dto.productImages;
        }

        // Handle flat FormData keys like productImages[0][url]
        const images: any[] = [];
        const imageKeys = Object.keys(dto).filter(key => key.startsWith('productImages['));

        imageKeys.forEach(key => {
            const indexMatch = key.match(/\[(\d+)\]/);
            const propMatch = key.match(/\]\[(\w+)\]/);

            if (indexMatch && propMatch) {
                const index = parseInt(indexMatch[1]);
                const prop = propMatch[1];

                if (!images[index]) images[index] = {};
                images[index][prop] = dto[key];
            }
        });

        return images.filter(img => img && img.url);
    }

    async remove(id: number) {
        return this.productRepository.softDelete(id);
    }

    async getRentalHistory(id: number) {
        return this.productRepository.findRentalHistory(id);
    }
}
