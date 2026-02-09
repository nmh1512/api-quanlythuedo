import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsOptional()
    parentId?: number;
}
