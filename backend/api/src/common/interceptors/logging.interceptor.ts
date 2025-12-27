import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);
    private readonly enableRequestLogging =
        process.env.ENABLE_REQUEST_LOGGING === 'true';

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        if (!this.enableRequestLogging) {
            return next.handle();
        }

        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const { method, url, body, query, params } = request;
        const now = Date.now();

        this.logger.log(
            `Incoming Request: ${method} ${url} - Body: ${JSON.stringify(body)} - Query: ${JSON.stringify(query)} - Params: ${JSON.stringify(params)}`,
        );

        return next.handle().pipe(
            tap((data) => {
                const delay = Date.now() - now;
                this.logger.log(
                    `Outgoing Response: ${method} ${url} - Status: ${response.statusCode} - ${delay}ms - Data: ${JSON.stringify(data)}`,
                );
            }),
        );
    }
}
