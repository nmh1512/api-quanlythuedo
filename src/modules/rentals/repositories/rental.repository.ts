import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Rental, Prisma } from '@/generated/prisma/client';

@Injectable()
export class RentalRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.RentalWhereUniqueInput;
        where?: Prisma.RentalWhereInput;
        orderBy?: Prisma.RentalOrderByWithRelationInput;
    }): Promise<Rental[]> {
        return this.prisma.rental.findMany({
            ...params,
            where: {
                ...params.where,
                deletedAt: null,
            },
            include: {
                customer: true,
                branch: true,
                rentalItems: {
                    include: {
                        productItem: {
                            include: {
                                product: {
                                    include: {
                                        productImages: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    async findById(id: number): Promise<Rental | null> {
        return this.prisma.rental.findUnique({
            where: { id, deletedAt: null },
            include: {
                customer: true,
                branch: true,
                rentalItems: {
                    include: {
                        productItem: {
                            include: {
                                product: {
                                    include: {
                                        productImages: true,
                                    },
                                },
                            },
                        },
                    },
                },
                payments: true,
                penalties: true,
            },
        });
    }

    async create(data: Prisma.RentalCreateInput): Promise<Rental> {
        return this.prisma.rental.create({
            data,
        });
    }

    async update(id: number, data: Prisma.RentalUpdateInput): Promise<Rental> {
        return this.prisma.rental.update({
            where: { id },
            data,
        });
    }

    async softDelete(id: number): Promise<Rental> {
        return this.prisma.rental.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
