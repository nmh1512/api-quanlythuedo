import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    basePrice: number;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    categoryId: number;

    @IsArray()
    @IsOptional()
    productImages?: any[];
}
