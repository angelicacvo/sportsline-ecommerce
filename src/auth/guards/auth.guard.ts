import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * AUTH GUARD (VERSIÓN SIMPLE)
 * 
 * CÓMO FUNCIONA:
 * 1. Verifica que el usuario tenga un token JWT válido
 * 2. Extrae la información del token (id, email, rol)
 * 3. Adjunta esta info al request para que otros guards (RolesGuard) la usen
 * 
 * NOTA: No necesita cargar el usuario de BD porque el JWT ya tiene el rol
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request)
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      // 1. Verificar el token JWT
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      
      // 2. Adjuntar el payload al request
      // payload tiene: { sub: userId, email: userEmail, role: 'admin'/'customer'/etc }
      request['user'] = payload;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
