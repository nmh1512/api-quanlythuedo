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

    async create(dto: CreateProductDto) {
        return this.productRepository.create({
            name: dto.name,
            description: dto.description,
            basePrice: dto.basePrice,
            category: { connect: { id: dto.categoryId } },
        });
    }

    async update(id: number, dto: UpdateProductDto) {
        return this.productRepository.update(id, dto);
    }

    async remove(id: number) {
        return this.productRepository.softDelete(id);
    }

    async getRentalHistory(id: number) {
        return this.productRepository.findRentalHistory(id);
    }
}
