import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
    @IsString({ message: 'Tên khách hàng phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Vui lòng nhập tên khách hàng' })
    name: string;

    @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại khách hàng' })
    phone: string;

    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsOptional()
    email?: string;

    @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
    @IsOptional()
    address?: string;
}
