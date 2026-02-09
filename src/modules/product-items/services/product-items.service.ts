import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductItemRepository } from '../repositories/product-item.repository';
import { CreateProductItemDto } from '../dto/create-product-item.dto';
import { UpdateProductItemDto } from '../dto/update-product-item.dto';

@Injectable()
export class ProductItemsService {
    constructor(private readonly productItemRepository: ProductItemRepository) { }

    async findAll() {
        return this.productItemRepository.findAll({});
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
            condition: dto.condition,
            status: dto.status,
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
