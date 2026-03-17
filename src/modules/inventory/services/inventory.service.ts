import { Injectable, BadRequestException } from '@nestjs/common';
import { InventoryRepository } from '../repositories/inventory.repository';
import { CreateReceiveDto, CreateDisposalDto } from '../dto/inventory.dto';
import { PrismaService } from '@/database/prisma.service';
import { PurchaseOrderType, PurchaseOrderStatus, TransferType, ProductItemStatus } from '@/generated/prisma/client';
import { BaseService } from '@/common/pagination/base.service';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';

@Injectable()
export class InventoryService extends BaseService<any> {
    constructor(
        private readonly inventoryRepository: InventoryRepository,
        private readonly prisma: PrismaService
    ) {
        super();
    }

    async findAllReceive(query: PaginationQueryDto) {
        const where: any = { type: PurchaseOrderType.IN, deletedAt: null };
        if (query.q) {
            where.orderCode = { contains: query.q };
        }
        return this.paginate(
            {
                findAll: (params) => this.inventoryRepository.findPurchaseOrders(params),
                count: (where) => this.inventoryRepository.countPurchaseOrders(where)
            } as any,
            query,
            { where },
            ['id', 'orderCode', 'createdAt']
        );
    }


    async findAllDisposal(query: PaginationQueryDto) {
        const where: any = { deletedAt: null };
        if (query.q) {
            where.disposalCode = { contains: query.q };
        }
        return this.paginate(
            {
                findAll: (params) => this.inventoryRepository.findDamageItems(params),
                count: (where) => this.inventoryRepository.countDamageItems(where)
            } as any,
            query,
            { where },
            ['id', 'disposalCode', 'createdAt']
        );
    }

    async findAllHistory(query: PaginationQueryDto) {
        // Fetch receipts and disposals separately for now and combine
        // Note: For large datasets, this should be a union query in repository
        const [orders, damageItems] = await Promise.all([
            this.inventoryRepository.findPurchaseOrders({
                where: { deletedAt: null, orderCode: query.q ? { contains: query.q } : undefined },
                orderBy: { createdAt: 'desc' },
                take: query.limit || 20,
            }),
            this.inventoryRepository.findDamageItems({
                where: { deletedAt: null, disposalCode: query.q ? { contains: query.q } : undefined },
                orderBy: { createdAt: 'desc' },
                take: query.limit || 20,
            })
        ]);

        const history = [
            ...orders.map(o => ({
                id: o.id,
                code: o.orderCode,
                createdAt: o.createdAt,
                type: o.type === PurchaseOrderType.IN ? 'NHẬP KHO' : 'XUẤT KHO',
                totalAmount: o.totalAmount,
                user: o.user?.name || 'Hệ thống',
                status: 'Hoàn thành'
            })),
            ...damageItems.map(d => ({
                id: d.id,
                code: d.disposalCode,
                createdAt: d.createdAt,
                type: 'XUẤT HỦY',
                totalAmount: d.totalAmount,
                user: d.user?.name || 'Hệ thống',
                status: 'Hoàn thành'
            }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return {
            data: history.slice(0, query.limit || 20),
            meta: {
                total: orders.length + damageItems.length // Simple total for now
            }
        };
    }

    async createReceive(userId: number, dto: CreateReceiveDto) {
        return this.prisma.$transaction(async (tx) => {
            const totalAmount = dto.items.reduce((sum, item) => sum + (item.price * item.quantity) - (item.discount || 0), 0);
            
            const order = await tx.purchaseOrder.create({
                data: {
                    orderCode: dto.orderCode,
                    type: PurchaseOrderType.IN,
                    status: PurchaseOrderStatus.COMPLETED,
                    supplierId: dto.supplierId,
                    branchId: dto.branchId,
                    userId: userId,
                    totalAmount: totalAmount,
                    discount: dto.discount || 0,
                    paidAmount: dto.paidAmount || totalAmount,
                    note: dto.note,
                }
            });

            for (const item of dto.items) {
                // Create log
                await tx.transferItem.create({
                    data: {
                        transferType: TransferType.PURCHASE,
                        recordId: order.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        discount: item.discount || 0,
                    }
                });

                // Create physical items
                if (item.variants && item.variants.length > 0) {
                    for (let i = 0; i < item.quantity; i++) {
                        const variant = item.variants[i] || {};
                        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
                        await tx.productItem.create({
                            data: {
                                productId: item.productId,
                                branchId: dto.branchId,
                                itemCode: variant.itemCode || `ITEM-${Date.now()}-${randomStr}-${i}`,
                                status: ProductItemStatus.AVAILABLE,
                                condition: variant.condition || 'NORMAL',
                                price: variant.price !== undefined ? variant.price : item.price,
                                note: variant.note || null
                            }
                        });
                    }
                } else {
                    for (let i = 0; i < item.quantity; i++) {
                        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
                        await tx.productItem.create({
                            data: {
                                productId: item.productId,
                                branchId: dto.branchId,
                                itemCode: `ITEM-${Date.now()}-${randomStr}-${i}`,
                                status: ProductItemStatus.AVAILABLE,
                                price: item.price,
                            }
                        });
                    }
                }
            }
            return order;
        });
    }


    async createDisposal(userId: number, dto: CreateDisposalDto) {
        return this.prisma.$transaction(async (tx) => {
            const totalAmount = dto.items.reduce((sum, item) => sum + (item.price * item.quantity) - (item.discount || 0), 0);

            const disposal = await tx.damageItem.create({
                data: {
                    disposalCode: dto.disposalCode,
                    branchId: dto.branchId,
                    userId: userId,
                    totalAmount: totalAmount,
                    note: dto.note,
                }
            });

            for (const item of dto.items) {
                await tx.transferItem.create({
                    data: {
                        transferType: TransferType.DAMAGE,
                        recordId: disposal.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        discount: item.discount || 0,
                    }
                });

                // Retire items
                const itemsToRetire = await tx.productItem.findMany({
                    where: {
                        productId: item.productId,
                        branchId: dto.branchId,
                        status: ProductItemStatus.AVAILABLE,
                    },
                    take: item.quantity
                });

                if (itemsToRetire.length < item.quantity) {
                    throw new BadRequestException(`Not enough items for product ID ${item.productId}`);
                }

                await tx.productItem.updateMany({
                    where: { id: { in: itemsToRetire.map(i => i.id) } },
                    data: { status: ProductItemStatus.RETIRED, deletedAt: new Date() }
                });
            }
            return disposal;
        });
    }
}
