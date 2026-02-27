import { Injectable, BadRequestException } from '@nestjs/common';
import { CustomerRepository } from '../repositories/customer.repository';
import { Prisma, Customer } from '@/generated/prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { BaseService } from '@/common/pagination/base.service';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';
import { PaginatedResponse } from '@/common/pagination/interfaces/paginated-response.interface';

@Injectable()
export class CustomersService extends BaseService<Customer> {
    constructor(
        private readonly customerRepository: CustomerRepository,
        private readonly prisma: PrismaService,
    ) {
        super();
    }

    async findAll(query: PaginationQueryDto) {
        const { page = 1, limit = 10, sortBy = 'id', order = 'DESC', q = '' } = query;
        const skip = (page - 1) * limit;

        const allowedSort = ['id', 'name', 'phone', 'email', 'createdAt', 'updatedAt', 'orderCount', 'totalSpent'];
        const safeSort = allowedSort.includes(sortBy) ? sortBy : 'id';
        const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const searchPattern = `%${q}%`;

        // 1. Get total records
        const totalResult: any = await this.prisma.$queryRaw`
            SELECT COUNT(id) as count
            FROM customers
            WHERE deleted_at IS NULL
              AND (name LIKE ${searchPattern} OR phone LIKE ${searchPattern} OR email LIKE ${searchPattern})
        `;
        const total = Number(totalResult[0].count);

        let orderBySql = '';
        if (safeSort === 'orderCount') {
            orderBySql = `ORDER BY orderCount ${safeOrder}`;
        } else if (safeSort === 'totalSpent') {
            orderBySql = `ORDER BY totalSpent ${safeOrder}`;
        } else if (safeSort === 'createdAt') {
            orderBySql = `ORDER BY created_at ${safeOrder}`;
        } else if (safeSort === 'updatedAt') {
            orderBySql = `ORDER BY updated_at ${safeOrder}`;
        } else {
            orderBySql = `ORDER BY ${safeSort} ${safeOrder}`;
        }

        // 2. Get paginated data with join
        const data: any[] = await this.prisma.$queryRawUnsafe(`
            SELECT 
              c.id, c.name, c.phone, c.email, c.address, c.created_at as createdAt, c.updated_at as updatedAt,
              COUNT(r.id) as orderCount,
              CAST(COALESCE(SUM(r.total_price + r.deposit), 0) AS UNSIGNED) as totalSpent
            FROM customers c
            LEFT JOIN rentals r ON c.id = r.customer_id AND r.deleted_at IS NULL
            WHERE c.deleted_at IS NULL
              AND (c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)
            GROUP BY c.id
            ${orderBySql}
            LIMIT ? OFFSET ?
        `, searchPattern, searchPattern, searchPattern, limit, skip);

        const mappedData = data.map(item => ({
            ...item,
            orderCount: Number(item.orderCount),
            totalSpent: Number(item.totalSpent)
        }));

        return new PaginatedResponse(mappedData, total, page, limit);
    }

    async create(data: Prisma.CustomerCreateInput) {
        try {
            return await this.customerRepository.create(data);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Số điện thoại hoặc email đã tồn tại trong hệ thống');
            }
            throw error;
        }
    }

    async update(id: number, data: Prisma.CustomerUpdateInput) {
        try {
            return await this.customerRepository.update(id, data);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Số điện thoại hoặc email đã tồn tại trong hệ thống');
            }
            throw error;
        }
    }

    async remove(id: number) {
        return this.customerRepository.softDelete(id);
    }

    async findById(id: number) {
        return this.customerRepository.findById(id);
    }
}
