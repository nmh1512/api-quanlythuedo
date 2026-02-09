export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: any;
    timestamp: string;
}
