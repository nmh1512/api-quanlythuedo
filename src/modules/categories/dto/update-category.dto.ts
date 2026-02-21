import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsOptional()
    parentId?: number;
}
