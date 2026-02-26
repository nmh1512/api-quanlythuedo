import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ProductItemStatus } from '@/generated/prisma/client';

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

}
