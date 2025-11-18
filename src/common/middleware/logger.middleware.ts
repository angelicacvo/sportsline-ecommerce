import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // Logger es una clase de NestJS para mostrar mensajes en consola
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    // Obtener información básica de la petición
    const { method, originalUrl } = req;
    const startTime = Date.now();

    this.logger.log(`${method} ${originalUrl}`);

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      this.logger.log(
        `${method} ${originalUrl} - Status: ${statusCode} - ${responseTime}ms`,
      );
    });

    next();
  }
}

