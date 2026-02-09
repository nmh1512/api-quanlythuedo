import { Injectable } from '@nestjs/common';
import { differenceInDays, startOfDay } from 'date-fns';
import { Prisma } from '@prisma/client';

@Injectable()
export class PricingService {
    calculateRentalPrice(basePrice: Prisma.Decimal | number, startDate: Date, endDate: Date): number {
        const days = differenceInDays(startOfDay(endDate), startOfDay(startDate)) + 1;
        const pricePerDay = typeof basePrice === 'number' ? basePrice : basePrice.toNumber();
        return pricePerDay * Math.max(days, 1);
    }

    calculateTotalPrice(items: { basePrice: Prisma.Decimal | number }[], startDate: Date, endDate: Date): number {
        return items.reduce((total, item) => {
            return total + this.calculateRentalPrice(item.basePrice, startDate, endDate);
        }, 0);
    }
}
