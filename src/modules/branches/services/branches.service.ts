import { Injectable, NotFoundException } from '@nestjs/common';
import { BranchRepository } from '../repositories/branch.repository';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { Branch, Prisma } from '@/generated/prisma/client';
import { BaseService } from '@/common/pagination/base.service';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';
import { PaginatedResponse } from '@/common/pagination/interfaces/paginated-response.interface';

@Injectable()
export class BranchesService extends BaseService<Branch> {
    constructor(private readonly branchRepository: BranchRepository) {
        super();
    }

    async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<Branch>> {
        const where: Prisma.BranchWhereInput = query.q ? {
            OR: [
                { name: { contains: query.q } },
                { address: { contains: query.q } },
            ],
        } : {};

        return this.paginate(
            this.branchRepository,
            query,
            { where },
            ['id', 'name', 'createdAt', 'updatedAt']
        );
    }

    async findOne(id: number) {
        const branch = await this.branchRepository.findById(id);
        if (!branch) {
            throw new NotFoundException('Branch not found');
        }
        return branch;
    }

    async create(dto: CreateBranchDto) {
        return this.branchRepository.create({
            name: dto.name,
            address: dto.address,
        });
    }

    async update(id: number, dto: Partial<CreateBranchDto>) {
        return this.branchRepository.update(id, dto);
    }

    async remove(id: number) {
        return this.branchRepository.softDelete(id);
    }
}
