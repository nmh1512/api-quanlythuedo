import { Injectable } from '@nestjs/common';
import { CalendarService } from '@/modules/calendar/services/calendar.service';
import { ProductItemRepository } from '@/modules/product-items/repositories/product-item.repository';

@Injectable()
export class AvailabilityService {
    constructor(
        private readonly calendarService: CalendarService,
        private readonly productItemRepository: ProductItemRepository,
    ) { }

    async isItemAvailable(productItemId: number, startDate: Date, endDate: Date): Promise<boolean> {
        const item = await this.productItemRepository.findById(productItemId);
        if (!item || item.status !== 'available') {
            return false;
        }

        return this.calendarService.checkItemAvailability(productItemId, startDate, endDate);
    }

    async getAvailableItemsByProduct(productId: number, startDate: Date, endDate: Date) {
        const items = await this.productItemRepository.findAll({
            where: { productId, status: 'available' },
        });

        const availableItems: any[] = [];
        for (const item of items) {
            const isAvailable = await this.calendarService.checkItemAvailability(item.id, startDate, endDate);
            if (isAvailable) {
                availableItems.push(item);
            }
        }

        return availableItems;
    }
}
