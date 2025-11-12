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
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message: any = 'Error interno del servidor';
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const errorResponse = exception.getResponse();
  
        // Normalizar si el mensaje viene como objeto
        if (typeof errorResponse === 'string') {
          message = errorResponse;
        } else if (typeof errorResponse === 'object' && errorResponse !== null) {
          message = (errorResponse as any).message || JSON.stringify(errorResponse);
        }
      } else if (exception instanceof Error) {
        // Si fue un error de JavaScript normal
        message = exception.message;
      }
  
      console.error('🚨 Excepción capturada:', exception);
  
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
      });
    }
  }
  