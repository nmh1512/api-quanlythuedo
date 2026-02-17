import { IsArray, IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateRentalDto {
    @IsInt()
    @IsNotEmpty()
    customerId: number;

    @IsInt()
    @IsNotEmpty()
    branchId: number;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @IsArray()
    @IsInt({ each: true })
    @IsNotEmpty()
    productItemIds: number[];

    @IsNotEmpty()
    paymentMethod: string;

    @IsNotEmpty()
    amountPaid: number;
}

