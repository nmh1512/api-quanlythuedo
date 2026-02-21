import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category, Prisma } from '@/generated/prisma/client';
import { BaseService } from '@/common/pagination/base.service';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';
import { PaginatedResponse } from '@/common/pagination/interfaces/paginated-response.interface';

@Injectable()
export class CategoriesService extends BaseService<Category> {
    constructor(private readonly categoryRepository: CategoryRepository) {
        super();
    }

    async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<Category>> {
        const where: Prisma.CategoryWhereInput = {};

        if (query.q) {
            where.name = { contains: query.q };
        }

        return this.paginate(
            this.categoryRepository,
            query,
            { where },
            ['id', 'name', 'createdAt', 'updatedAt']
        );
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

    async update(id: number, dto: UpdateCategoryDto) {
        return this.categoryRepository.update(id, dto);
    }

    async remove(id: number) {
        return this.categoryRepository.softDelete(id);
    }
}
