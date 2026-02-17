import { Injectable, BadRequestException } from '@nestjs/common';
import { RentalRepository } from '../repositories/rental.repository';
import { ProductItemRepository } from '@/modules/product-items/repositories/product-item.repository';
import { CalendarService } from '@/modules/calendar/services/calendar.service';
import { PricingService } from '@/modules/pricing/services/pricing.service';
import { DepositService } from '@/modules/payments/services/deposit.service';
import { CreateRentalDto } from '../dto/create-rental.dto';
import { RentalStatus, CalendarStatus } from '@/generated/prisma/client';

@Injectable()
export class RentalsService {
    constructor(
        private readonly rentalRepository: RentalRepository,
        private readonly productItemRepository: ProductItemRepository,
        private readonly calendarService: CalendarService,
        private readonly pricingService: PricingService,
        private readonly depositService: DepositService,
    ) { }

    async createRental(dto: CreateRentalDto) {
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);

        const items: any[] = [];
        for (const itemId of dto.productItemIds) {
            const item: any = await this.productItemRepository.findById(itemId);
            if (!item || item.status !== 'available') {
                throw new BadRequestException(`Item ${itemId} is not available`);
            }

            const isAvailable = await this.calendarService.checkItemAvailability(itemId, startDate, endDate);
            if (!isAvailable) {
                throw new BadRequestException(`Item ${itemId} is already reserved for these dates`);
            }
            items.push(item);
        }

        const totalPrice = this.pricingService.calculateTotalPrice(
            items.map(i => ({ basePrice: i.product.basePrice })),
            startDate,
            endDate
        );
        const totalDeposit = this.depositService.calculateTotalDeposit(
            items.map(i => ({ basePrice: i.product.basePrice }))
        );

        const rental = await this.rentalRepository.create({
            customer: { connect: { id: dto.customerId } },
            branch: { connect: { id: dto.branchId } },
            status: RentalStatus.renting,
            startDate,
            endDate,
            totalPrice,
            deposit: totalDeposit,
            rentalItems: {
                create: items.map(item => ({
                    productItemId: item.id,
                    price: item.product.basePrice,
                })),
            },
            payments: {
                create: {
                    amount: dto.amountPaid,
                    method: dto.paymentMethod,
                    status: 'completed',
                },
            },
        });

        await this.calendarService.createCalendarEntries(
            dto.productItemIds,
            startDate,
            endDate,
            rental.id,
            CalendarStatus.renting
        );

        for (const itemId of dto.productItemIds) {
            await this.productItemRepository.update(itemId, { status: 'rented' });
        }

        return rental;
    }

    async findAll(params: any) {
        return this.rentalRepository.findAll(params);
    }

    async findOne(id: number) {
        return this.rentalRepository.findById(id);
    }

    async updateStatus(id: number, status: RentalStatus) {
        const rental = await this.rentalRepository.findById(id);
        if (!rental) {
            throw new BadRequestException("Rental not found");
        }

        if (rental.status === RentalStatus.returned || rental.status === RentalStatus.cancelled) {
            throw new BadRequestException("Rental is already finalized");
        }

        // 1. Update rental status
        const updatedRental = await this.rentalRepository.update(id, {
            status
        });

        // 2. If returned or cancelled, items go back to available
        if (status === RentalStatus.returned || status === RentalStatus.cancelled) {
            const productItemIds = (rental as any).rentalItems.map((item: any) => item.productItemId);
            for (const itemId of productItemIds) {
                await this.productItemRepository.update(itemId, {
                    status: 'available'
                });
            }
            // Also update calendar status if needed, but usually soft delete is enough 
            // the calendar service removeCalendarEntries handles this if we call it
            await this.calendarService.removeCalendarEntries(id);
        }

        return updatedRental;
    }
}
