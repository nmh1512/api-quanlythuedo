export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export class PaginatedResponse<T> {
    readonly data: T[];
    readonly meta: PaginationMeta;

    constructor(data: T[], total: number, page: number, limit: number) {
        const totalPages = Math.ceil(total / limit);
        this.data = data;
        this.meta = {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }
}
