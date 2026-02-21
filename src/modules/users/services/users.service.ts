import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { Prisma, User } from '@/generated/prisma/client';
import { BaseService } from '@/common/pagination/base.service';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';
import { PaginatedResponse } from '@/common/pagination/interfaces/paginated-response.interface';

@Injectable()
export class UsersService extends BaseService<User> {
    constructor(private readonly userRepository: UserRepository) {
        super();
    }

    async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<User>> {
        const where: Prisma.UserWhereInput = query.q ? {
            OR: [
                { name: { contains: query.q } },
                { email: { contains: query.q } },
            ],
        } : {};

        return this.paginate(
            this.userRepository,
            query,
            { where },
            ['id', 'name', 'email', 'createdAt', 'updatedAt']
        );
    }

    async create(data: Prisma.UserCreateInput) {
        return this.userRepository.create(data);
    }

    async findById(id: number) {
        return this.userRepository.findById(id);
    }
}
