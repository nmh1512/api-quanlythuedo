import { Injectable, NotFoundException } from '@nestjs/common';
import { SupplierRepository } from '../repositories/supplier.repository';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { BaseService } from '@/common/pagination/base.service';
import { Supplier, Prisma } from '@/generated/prisma/client';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';

@Injectable()
export class SuppliersService extends BaseService<Supplier> {
    constructor(private readonly supplierRepository: SupplierRepository) {
        super();
    }

    async findAll(query: PaginationQueryDto) {
        const where: Prisma.SupplierWhereInput = {
            deletedAt: null,
        };

        if (query.q) {
            where.OR = [
                { name: { contains: query.q } },
                { phone: { contains: query.q } },
                { email: { contains: query.q } },
            ];
        }

        return this.paginate(
            this.supplierRepository,
            query,
            { where },
            ['id', 'name', 'phone', 'email', 'createdAt']
        );
    }

    async findOne(id: number) {
        const supplier = await this.supplierRepository.findById(id);
        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }
        return supplier;
    }

    async create(dto: CreateSupplierDto) {
        return this.supplierRepository.create(dto);
    }

    async update(id: number, dto: UpdateSupplierDto) {
        await this.findOne(id);
        return this.supplierRepository.update(id, dto);
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.supplierRepository.softDelete(id);
    }
}
