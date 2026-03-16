import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsArray,
    IsBoolean,
    ValidateNested,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ItemCondition, ProductItemStatus } from '@/generated/prisma/client';

// --- Nested DTOs ---

export class ProductImageDto {
    @IsString({ message: 'URL hình ảnh phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'URL hình ảnh không được để trống' })
    url: string;

    @IsBoolean({ message: 'isPrimary phải là boolean' })
    @IsOptional()
    @Transform(({ value }) => value === true || value === 'true')
    isPrimary?: boolean = false;
}

export class ProductPropertyDto {
    @IsString({ message: 'Tên thuộc tính phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Tên thuộc tính không được để trống' })
    name: string;

    @IsString({ message: 'Giá trị thuộc tính phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Giá trị thuộc tính không được để trống' })
    value: string;
}

export class ProductVariantDto {
    @IsString()
    @IsOptional()
    itemCode?: string;

    @IsString()
    @IsOptional()
    status?: ProductItemStatus;

    @IsString()
    @IsOptional()
    condition?: ItemCondition;

    @IsNumber({}, { message: 'Số lượng phải là số' })
    @IsNotEmpty()
    @Type(() => Number)
    quantity: number;

    @IsNumber({}, { message: 'Giá phải là số' })
    @IsOptional()
    @Type(() => Number)
    price?: number;

    @IsString()
    @IsOptional()
    note?: string;
}

export class CreateProductDto {
    @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Vui lòng nhập tên sản phẩm' })
    name: string;

    @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
    @IsOptional()
    description?: string;

    @IsNumber({}, { message: 'Giá gốc phải là số' })
    @IsNotEmpty({ message: 'Vui lòng nhập giá gốc' })
    @Type(() => Number)
    basePrice: number;

    @IsNumber({}, { message: 'Tiền đặt cọc phải là số' })
    @IsOptional()
    @Type(() => Number)
    depositAmount?: number;

    @IsNumber({}, { message: 'Thời gian thuê tối thiểu phải là số' })
    @IsOptional()
    @Type(() => Number)
    minRentalDays?: number;

    @IsNumber({}, { message: 'Thời gian thuê tối đa phải là số' })
    @IsOptional()
    @Type(() => Number)
    maxRentalDays?: number;

    @IsString({ message: 'Điều khoản phải là chuỗi' })
    @IsOptional()
    termsAndConds?: string;

    @IsNumber({}, { message: 'ID danh mục phải là số' })
    @IsNotEmpty({ message: 'Vui lòng chọn danh mục' })
    @Type(() => Number)
    categoryId: number;

    @IsArray({ message: 'Loại dữ liệu hình ảnh không hợp lệ' })
    @ValidateNested({ each: true })
    @IsOptional()
    // @Transform chạy TRƯỚC, parse JSON string → plain objects → rồi plainToInstance tạo class instances
    // để @ValidateNested có đủ metadata để validate nested properties
    @Transform(({ value }) => {
        const parsed = typeof value === 'string'
            ? (() => { try { return JSON.parse(value); } catch { return []; } })()
            : value;
        return Array.isArray(parsed)
            ? plainToInstance(ProductImageDto, parsed)
            : [];
    })
    productImages?: ProductImageDto[];

    @IsArray({ message: 'Loại dữ liệu thuộc tính không hợp lệ' })
    @ValidateNested({ each: true })
    @IsOptional()
    // Tương tự: parse JSON string → plainToInstance để tạo ProductPropertyDto instances
    @Transform(({ value }) => {
        const parsed = typeof value === 'string'
            ? (() => { try { return JSON.parse(value); } catch { return []; } })()
            : value;
        return Array.isArray(parsed)
            ? plainToInstance(ProductPropertyDto, parsed)
            : [];
    })
    properties?: ProductPropertyDto[];

    @IsArray({ message: 'Dữ liệu phân loại sản phẩm không hợp lệ' })
    @ValidateNested({ each: true })
    @IsOptional()
    @Transform(({ value }) => {
        const parsed = typeof value === 'string'
            ? (() => { try { return JSON.parse(value); } catch { return []; } })()
            : value;
        return Array.isArray(parsed)
            ? plainToInstance(ProductVariantDto, parsed)
            : [];
    })
    variants?: ProductVariantDto[];
}
