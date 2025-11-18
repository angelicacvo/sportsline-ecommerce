import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// @Catch(HttpException) = "Catches all HTTP exceptions"
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  // Logger to register errors in console
  private readonly logger = new Logger(HttpExceptionFilter.name);

  // This method executes when an error occurs
  catch(exception: HttpException, host: ArgumentsHost) {
    // 1. Get HTTP context (request and response)
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 2. Get error information
    const status = exception.getStatus(); // 400, 404, 500, etc.
    const exceptionResponse = exception.getResponse(); // Error message

    // 3. Build error message (can be string or object)
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    // 4. Create custom response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
    };

    // 5. Log error in console
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
    );

    // 6. Send response to client
    response.status(status).json(errorResponse);
  }
}

