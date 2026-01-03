import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '../dto/error-response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    let details: string[] | undefined;

    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const responseMessage = (exceptionResponse as any).message;
      if (Array.isArray(responseMessage)) {
        details = responseMessage;
        message = 'Validation failed';
      } else {
        message = responseMessage;
      }
    }

    const errorResponse = new ErrorResponse(
      message,
      HttpStatus[status],
      details,
      request.url,
    );

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }
}
