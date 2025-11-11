import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// @Catch(HttpException) = "Atrapa todas las excepciones HTTP"
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  // Logger para registrar los errores en consola
  private readonly logger = new Logger(HttpExceptionFilter.name);

  // Este método se ejecuta cuando ocurre un error
  catch(exception: HttpException, host: ArgumentsHost) {
    // 1. Obtener el contexto HTTP (request y response)
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 2. Obtener información del error
    const status = exception.getStatus(); // 400, 404, 500, etc.
    const exceptionResponse = exception.getResponse(); // Mensaje del error

    // 3. Construir mensaje de error (puede ser string u objeto)
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    // 4. Crear respuesta personalizada
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
    };

    // 5. Registrar el error en consola
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
    );

    // 6. Enviar respuesta al cliente
    response.status(status).json(errorResponse);
  }
}
