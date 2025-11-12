import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class FakeUserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Simulamos un usuario logueado
    req['user'] = {
      id: 1,
      name: 'Admin Test',
      email: 'admin@example.com',
      role: 'admin', // 👈 clave para el guard
    };

    console.log('🧑‍💻 Usuario simulado inyectado en la request:', req['user']);
    next();
  }
}
