import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body } = req;
    const timestamp = new Date().toISOString();

    console.log(`[AUDIT] ${method} ${originalUrl} - ${timestamp}`);
    console.log('Body:', body);

    // Ejemplo simple de validación básica
    if (method === 'POST' && !body) {
      return res
        .status(400)
        .json({ message: 'El cuerpo de la petición no puede estar vacío' });
    }

    next();
  }
}
