import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class PaginationQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    readonly page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    readonly limit: number = 10;

    @IsOptional()
    @IsString()
    readonly sortBy?: string;

    @IsOptional()
    @IsEnum(SortOrder)
    readonly order: SortOrder = SortOrder.ASC;

    @IsOptional()
    @IsString()
    readonly q?: string;

    @IsOptional()
    @IsString()
    readonly status?: string;

    get skip(): number {
        return (this.page - 1) * this.limit;
    }
}
