import { IsArray, IsDateString, IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRentalDto {
    @IsInt({ message: 'ID khách hàng phải là số nguyên' })
    @IsNotEmpty({ message: 'Vui lòng chọn khách hàng' })
    customerId: number;

    @IsInt({ message: 'ID chi nhánh phải là số nguyên' })
    @IsNotEmpty({ message: 'Vui lòng chọn chi nhánh' })
    branchId: number;

    @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
    @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
    startDate: string;

    @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
    @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
    endDate: string;

    @IsArray({ message: 'Danh sách sản phẩm không hợp lệ' })
    @IsInt({ each: true, message: 'ID sản phẩm phải là số nguyên' })
    @IsNotEmpty({ message: 'Vui lòng chọn ít nhất một sản phẩm' })
    productItemIds: number[];

    @IsNotEmpty({ message: 'Vui lòng chọn phương thức thanh toán' })
    paymentMethod: string;

    @IsNumber({}, { message: 'Số tiền thanh toán phải là số' })
    @IsNotEmpty({ message: 'Vui lòng nhập số tiền thanh toán' })
    amountPaid: number;
}

