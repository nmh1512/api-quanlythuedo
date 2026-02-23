import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@/common/pagination/dto/pagination-query.dto';

export class GetDailyReportDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    date?: string;
}
