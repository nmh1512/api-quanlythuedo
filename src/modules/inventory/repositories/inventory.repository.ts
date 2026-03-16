import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PurchaseOrder, DamageItem, Prisma } from '@/generated/prisma/client';

@Injectable()
export class InventoryRepository {
    constructor(private readonly prisma: PrismaService) { }

    // Purchase Orders (IN/OUT)
    async findPurchaseOrders(params: Prisma.PurchaseOrderFindManyArgs) {
        return this.prisma.purchaseOrder.findMany({
            ...params,
            where: {
                ...params.where,
                deletedAt: null,
            },
            include: {
                supplier: true,
                branch: true,
                user: true,
                ...params.include
            }
        });
    }

    async countPurchaseOrders(where: Prisma.PurchaseOrderWhereInput) {
        return this.prisma.purchaseOrder.count({
            where: { ...where, deletedAt: null }
        });
    }

    async findPurchaseOrderById(id: number) {
        return this.prisma.purchaseOrder.findUnique({
            where: { id, deletedAt: null },
            include: {
                supplier: true,
                branch: true,
                user: true
            }
        });
    }

    async createPurchaseOrder(data: Prisma.PurchaseOrderCreateInput) {
        return this.prisma.purchaseOrder.create({ data });
    }

    // Damage Items (Disposal)
    async findDamageItems(params: Prisma.DamageItemFindManyArgs) {
        return this.prisma.damageItem.findMany({
            ...params,
            where: {
                ...params.where,
                deletedAt: null,
            },
            include: {
                branch: true,
                user: true,
                ...params.include
            }
        });
    }

    async countDamageItems(where: Prisma.DamageItemWhereInput) {
        return this.prisma.damageItem.count({
            where: { ...where, deletedAt: null }
        });
    }

    async findDamageItemById(id: number) {
        return this.prisma.damageItem.findUnique({
            where: { id, deletedAt: null },
            include: {
                branch: true,
                user: true
            }
        });
    }

    async createDamageItem(data: Prisma.DamageItemCreateInput) {
        return this.prisma.damageItem.create({ data });
    }

    // Transfer Items (Common for all)
    async findTransferItems(params: Prisma.TransferItemFindManyArgs) {
        return this.prisma.transferItem.findMany(params);
    }

    async createTransferItem(data: Prisma.TransferItemCreateInput) {
        return this.prisma.transferItem.create({ data });
    }
}
