import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Vui lòng nhập email' })
    email: string;

    @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password: string;

    @IsString({ message: 'Tên phải là chuỗi ký tự' })
    @IsOptional()
    name?: string;

    @IsString({ message: 'Vai trò phải là chuỗi ký tự' })
    @IsOptional()
    role?: string;
}
