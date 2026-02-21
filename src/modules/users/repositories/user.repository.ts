import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { User, Prisma } from '@/generated/prisma/client';

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email, deletedAt: null },
        });
    }

    async findById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id, deletedAt: null },
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }

    async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async findAll(params: Prisma.UserFindManyArgs = {}): Promise<User[]> {
        return this.prisma.user.findMany({
            ...params,
            where: {
                ...params.where,
                deletedAt: null
            },
        });
    }

    async count(where: Prisma.UserWhereInput = {}): Promise<number> {
        return this.prisma.user.count({
            where: {
                ...where,
                deletedAt: null
            }
        });
    }
}
