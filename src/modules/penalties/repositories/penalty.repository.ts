import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Penalty, Prisma } from '@prisma/client';

@Injectable()
export class PenaltyRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(where?: Prisma.PenaltyWhereInput): Promise<Penalty[]> {
        return this.prisma.penalty.findMany({ where });
    }

    async findById(id: number): Promise<Penalty | null> {
        return this.prisma.penalty.findUnique({ where: { id } });
    }

    async create(data: Prisma.PenaltyCreateInput): Promise<Penalty> {
        return this.prisma.penalty.create({ data });
    }

    async update(id: number, data: Prisma.PenaltyUpdateInput): Promise<Penalty> {
        return this.prisma.penalty.update({ where: { id }, data });
    }
}
