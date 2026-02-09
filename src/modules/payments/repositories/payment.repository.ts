import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Payment, Prisma } from '@prisma/client';

@Injectable()
export class PaymentRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(where?: Prisma.PaymentWhereInput): Promise<Payment[]> {
        return this.prisma.payment.findMany({ where });
    }

    async findById(id: number): Promise<Payment | null> {
        return this.prisma.payment.findUnique({ where: { id } });
    }

    async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
        return this.prisma.payment.create({ data });
    }

    async update(id: number, data: Prisma.PaymentUpdateInput): Promise<Payment> {
        return this.prisma.payment.update({ where: { id }, data });
    }
}
