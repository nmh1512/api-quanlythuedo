import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Rental, Prisma } from '@/generated/prisma/client';
import { getBranchId } from '@/common/branch-context';

@Injectable()
export class RentalRepository {
    constructor(private readonly prisma: PrismaService) { }

    private get branchWhere(): Prisma.RentalWhereInput {
        const branchId = getBranchId();
        return branchId ? { branchId } : {};
    }

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
                ...this.branchWhere,
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

    async count(where: Prisma.RentalWhereInput = {}): Promise<number> {
        return this.prisma.rental.count({
            where: {
                ...where,
                ...this.branchWhere,
                deletedAt: null,
            },
        });
    }

    async findById(id: number): Promise<Rental | null> {
        return this.prisma.rental.findFirst({
            where: {
                id,
                ...this.branchWhere,
                deletedAt: null
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
                payments: true,
                penalties: true,
            },
        });
    }

    async create(data: Prisma.RentalCreateInput): Promise<Rental> {
        const branchId = getBranchId();
        const createData = { ...data };

        if (branchId && !createData.branch) {
            createData.branch = { connect: { id: branchId } };
        }

        return this.prisma.rental.create({
            data: createData,
        });
    }

    async update(id: number, data: Prisma.RentalUpdateInput): Promise<Rental> {
        await this.prisma.rental.updateMany({
            where: {
                id,
                ...this.branchWhere
            },
            data,
        });
        const updated = await this.findById(id);
        if (!updated) throw new Error('Rental not found or access denied');
        return updated;
    }

    async softDelete(id: number): Promise<Rental> {
        await this.prisma.rental.updateMany({
            where: {
                id,
                ...this.branchWhere
            },
            data: { deletedAt: new Date() },
        });
        const deleted = await this.prisma.rental.findFirst({ where: { id } });
        if (!deleted) throw new Error('Rental not found');
        return deleted;
    }
}
