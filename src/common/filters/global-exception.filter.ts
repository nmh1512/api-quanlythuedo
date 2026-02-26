import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        console.error('--- Exception caught by GlobalExceptionFilter ---');
        console.error(exception);
        console.error('--------------------------------------------------');

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const rawResponse =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        const message = typeof rawResponse === 'string' 
            ? rawResponse 
            : Array.isArray((rawResponse as any).message)
                ? (rawResponse as any).message[0]
                : (rawResponse as any).message || 'Internal server error';

        response.status(status).json({
            success: false,
            message,
            errors: typeof rawResponse === 'object' ? (rawResponse as any).error : null,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
