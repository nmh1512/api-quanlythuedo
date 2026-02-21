import { PaginatedResponse } from './interfaces/paginated-response.interface';
import { PaginationQueryDto, SortOrder } from './dto/pagination-query.dto';

export interface IRepository<T> {
    findAll: (args: any) => Promise<T[]>;
    count: (where?: any) => Promise<number>;
}

export abstract class BaseService<T> {

    /**
     * Phương thức phân trang dùng chung cho mọi Model
     * Thay vì couple trực tiếp vào Prisma Delegate, ta dựa vào abstract IRepository.
     *
     * @param repository Tham chiếu đến Repository của module
     * @param query DTO chứa các thông tin phân trang (page, limit, sortBy, order)
     * @param findArgs Các điều kiện where bổ sung
     * @param allowedSortFields Danh sách whitelist các thuộc tính cho phép sắp xếp (chống injection)
     */
    protected async paginate(
        repository: IRepository<T>,
        query: PaginationQueryDto,
        findArgs: Record<string, any> = {},
        allowedSortFields: string[] = [],
    ): Promise<PaginatedResponse<T>> {
        const { page, limit, sortBy, order, skip } = query;

        const args: Record<string, any> = { ...findArgs, skip, take: limit };

        if (sortBy && allowedSortFields.includes(sortBy)) {
            args.orderBy = {
                [sortBy]: order === SortOrder.DESC ? 'desc' : 'asc',
            };
        } else if (!args.orderBy) {
            args.orderBy = { id: 'desc' };
        }

        const [data, total] = await Promise.all([
            repository.findAll(args),
            repository.count(args.where || {}),
        ]);

        return new PaginatedResponse<T>(data, total, page, limit);
    }
}
