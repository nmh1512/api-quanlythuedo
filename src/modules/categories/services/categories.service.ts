import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDto } from '../dto/create-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private readonly categoryRepository: CategoryRepository) { }

    async findAll() {
        return this.categoryRepository.findAll();
    }

    async findOne(id: number) {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    async create(dto: CreateCategoryDto) {
        return this.categoryRepository.create({
            name: dto.name,
            parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
        });
    }

    async update(id: number, dto: any) {
        return this.categoryRepository.update(id, dto);
    }

    async remove(id: number) {
        return this.categoryRepository.softDelete(id);
    }
}
