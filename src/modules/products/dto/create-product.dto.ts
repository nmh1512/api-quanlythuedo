import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

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

    @IsNumber({}, { message: 'ID danh mục phải là số' })
    @IsNotEmpty({ message: 'Vui lòng chọn danh mục' })
    @Type(() => Number)
    categoryId: number;

    @IsArray({ message: 'Loại dữ liệu hình ảnh không hợp lệ' })
    @IsOptional()
    productImages?: { url: string; isPrimary: boolean }[];

    @IsArray({ message: 'Loại dữ liệu thuộc tính không hợp lệ' })
    @IsOptional()
    properties?: { name: string; value: string }[];

    @IsNumber({}, { message: 'Số lượng phải là số' })
    @IsOptional()
    @Type(() => Number)
    quantity?: number;
}
