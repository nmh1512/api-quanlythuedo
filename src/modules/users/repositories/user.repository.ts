import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { User, Prisma } from '@prisma/client';

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

    async search(query?: string) {
        if (!query) {
             return this.prisma.user.findMany({
                where: { deletedAt: null },
                take: 20,
            });
        }
        return this.prisma.user.findMany({
            where: {
                deletedAt: null,
                OR: [
                    { name: { contains: query } },
                    { email: { contains: query } },
                ],
            },
            take: 20,
        });
    }
}
