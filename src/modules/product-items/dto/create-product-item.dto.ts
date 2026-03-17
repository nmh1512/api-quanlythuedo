import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ProductItemStatus, ItemCondition } from '@/generated/prisma/client';

export class CreateProductItemDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @IsNumber()
    @IsNotEmpty()
    branchId: number;

    @IsString()
    @IsNotEmpty()
    itemCode: string;

    @IsEnum(ProductItemStatus)
    @IsOptional()
    status?: ProductItemStatus;

    @IsEnum(ItemCondition)
    @IsOptional()
    condition?: ItemCondition;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    note?: string;
}
