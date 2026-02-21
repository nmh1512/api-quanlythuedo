import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../repositories/customer.repository';
import { Prisma, Customer } from '@/generated/prisma/client';
import { BaseService } from '@/common/pagination/base.service';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';
import { PaginatedResponse } from '@/common/pagination/interfaces/paginated-response.interface';

@Injectable()
export class CustomersService extends BaseService<Customer> {
    constructor(private readonly customerRepository: CustomerRepository) {
        super();
    }

    async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<Customer>> {
        const where: Prisma.CustomerWhereInput = query.q ? {
            OR: [
                { name: { contains: query.q } },
                { phone: { contains: query.q } },
                { email: { contains: query.q } },
            ],
        } : {};

        return this.paginate(
            this.customerRepository,
            query,
            { where },
            ['id', 'name', 'phone', 'email', 'createdAt', 'updatedAt']
        );
    }

    async create(data: Prisma.CustomerCreateInput) {
        return this.customerRepository.create(data);
    }

    async findById(id: number) {
        return this.customerRepository.findById(id);
    }
}
