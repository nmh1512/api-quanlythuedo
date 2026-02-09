import { Injectable, NotFoundException } from '@nestjs/common';
import { BranchRepository } from '../repositories/branch.repository';
import { CreateBranchDto } from '../dto/create-branch.dto';

@Injectable()
export class BranchesService {
    constructor(private readonly branchRepository: BranchRepository) { }

    async findAll() {
        return this.branchRepository.findAll();
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

    async update(id: number, dto: any) {
        return this.branchRepository.update(id, dto);
    }

    async remove(id: number) {
        return this.branchRepository.softDelete(id);
    }
}
