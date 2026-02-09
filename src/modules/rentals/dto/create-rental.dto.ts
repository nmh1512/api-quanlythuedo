import { IsArray, IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateRentalDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

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
}
