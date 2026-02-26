import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class ValidateItemDto {
    @IsString({ message: 'Mã sản phẩm phải là chuỗi ký tự' })
    @IsNotEmpty({ message: 'Mã sản phẩm không được để trống' })
    itemCode: string;

    @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
    @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
    startDate: string;

    @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
    @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
    endDate: string;
}
