import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Verificar Content-Type en peticiones con body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.get('content-type');

      // the content-type in body must be correct
      if (!contentType || !contentType.includes('application/json')) {
        throw new BadRequestException(
          'Content-Type must be application/json',
        );
      }
    }

    // Verify that the body is not empty in POST/PUT
    if (['POST', 'PUT'].includes(req.method)) {
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new BadRequestException('Request body cannot be empty');
      }
    }

    next();
  }
}
