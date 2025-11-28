import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const error: any = exception.getError();
    const status = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Microservice error';

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      error: 'Microservice Error',
    };

    this.logger.error(
      `Microservice error: ${request.method} ${request.url} - ${message}`,
    );

    response.status(status).json(errorResponse);
  }
}
