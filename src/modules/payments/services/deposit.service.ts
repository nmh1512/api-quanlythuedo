import { Injectable } from '@nestjs/common';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class DepositService {
    private readonly DEPOSIT_PERCENTAGE = 0.5; // 50% of base price as deposit for example

    calculateDeposit(basePrice: Prisma.Decimal | number): number {
        const price = typeof basePrice === 'number' ? basePrice : basePrice.toNumber();
        return price * this.DEPOSIT_PERCENTAGE;
    }

    calculateTotalDeposit(items: { basePrice: Prisma.Decimal | number }[]): number {
        return items.reduce((total, item) => {
            return total + this.calculateDeposit(item.basePrice);
        }, 0);
    }
}
