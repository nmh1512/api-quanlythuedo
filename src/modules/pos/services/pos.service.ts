import { Injectable, BadRequestException } from '@nestjs/common';
import { CalendarService } from '@/modules/calendar/services/calendar.service';
import { PricingService } from '@/modules/pricing/services/pricing.service';
import { DepositService } from '@/modules/payments/services/deposit.service';
import { ProductItemRepository } from '@/modules/product-items/repositories/product-item.repository';
import { RentalRepository } from '@/modules/rentals/repositories/rental.repository';
import { ProductItem, Product } from '@/generated/prisma/client';

@Injectable()
export class POSService {
    constructor(
        private readonly calendarService: CalendarService,
        private readonly pricingService: PricingService,
        private readonly depositService: DepositService,
        private readonly productItemRepository: ProductItemRepository,
        private readonly rentalRepository: RentalRepository,
    ) { }

    async validateItem(itemCode: string, startDate: Date, endDate: Date) {
        const rawItem = await this.productItemRepository.findByCode(itemCode);
        if (!rawItem) {
            throw new BadRequestException('Item not found');
        }
        const item = rawItem as ProductItem & { product: Product };

        if (item.status !== 'available') {
            throw new BadRequestException(`Item status is ${item.status}`);
        }

        const isAvailable = await this.calendarService.checkItemAvailability(item.id, startDate, endDate);
        if (!isAvailable) {
            throw new BadRequestException('Item is already reserved for these dates');
        }

        const price = this.pricingService.calculateRentalPrice(item.product.basePrice, startDate, endDate);
        const deposit = this.depositService.calculateDeposit(item.product.basePrice);

        return {
            item,
            price,
            deposit,
        };
    }
}
