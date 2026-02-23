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

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        response.status(status).json({
            success: false,
            message: typeof message === 'string' ? message : (message as any).message,
            errors: typeof message === 'object' ? (message as any).error || (message as any).message : null,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
