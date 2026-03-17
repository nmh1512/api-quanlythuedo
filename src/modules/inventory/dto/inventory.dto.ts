import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseOrderType, ItemCondition } from '@/generated/prisma/client';

export class TransferItemVariantDto {
    @IsString()
    @IsOptional()
    itemCode?: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsEnum(ItemCondition)
    @IsOptional()
    condition?: ItemCondition;

    @IsString()
    @IsOptional()
    note?: string;
}

export class CreateTransferItemDto {
    @IsInt()
    @IsNotEmpty()
    productId: number;

    @IsInt()
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsNumber()
    @IsOptional()
    discount?: number;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => TransferItemVariantDto)
    variants?: TransferItemVariantDto[];
}

export class CreateReceiveDto {
    @IsString()
    @IsNotEmpty()
    orderCode: string;

    @IsInt()
    @IsOptional()
    supplierId?: number;

    @IsInt()
    @IsNotEmpty()
    branchId: number;

    @IsNumber()
    @IsOptional()
    discount?: number;

    @IsNumber()
    @IsOptional()
    paidAmount?: number;

    @IsString()
    @IsOptional()
    note?: string;

    @ValidateNested({ each: true })
    @Type(() => CreateTransferItemDto)
    items: CreateTransferItemDto[];
}


export class CreateDisposalDto {
    @IsString()
    @IsNotEmpty()
    disposalCode: string;

    @IsInt()
    @IsNotEmpty()
    branchId: number;

    @IsString()
    @IsOptional()
    note?: string;

    @ValidateNested({ each: true })
    @Type(() => CreateTransferItemDto)
    items: CreateTransferItemDto[];
}
