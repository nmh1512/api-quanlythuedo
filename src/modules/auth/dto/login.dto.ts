import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Vui lòng nhập email' })
    email: string;

    @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
    password: string;
}
