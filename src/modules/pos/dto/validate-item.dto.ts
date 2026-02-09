import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class ValidateItemDto {
    @IsString()
    @IsNotEmpty()
    itemCode: string;

    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @IsDateString()
    @IsNotEmpty()
    endDate: string;
}
