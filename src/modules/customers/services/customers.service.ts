import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../repositories/customer.repository';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class CustomersService {
    constructor(private readonly customerRepository: CustomerRepository) { }

    async findAll(query?: string) {
        return this.customerRepository.search(query);
    }

    async create(data: Prisma.CustomerCreateInput) {
        return this.customerRepository.create(data);
    }

    async findById(id: number) {
        return this.customerRepository.findById(id);
    }
}
