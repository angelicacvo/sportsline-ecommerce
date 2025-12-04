import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      console.log('🔹 Roles requeridos:', requiredRoles);
      console.log('🔹 Usuario recibido en el guard:', user);

      if (!requiredRoles || requiredRoles.length === 0) {
        console.log('✅ Sin roles requeridos, permitiendo acceso.');
        return true;
      }

      if (!user) {
        console.error('❌ Usuario no encontrado en la request');
        throw new ForbiddenException('Usuario no encontrado en la request');
      }

      if (!user.role) {
        console.error('❌ El usuario no tiene un rol asignado');
        throw new ForbiddenException('El usuario no tiene un rol asignado');
      }

      const hasRole = requiredRoles.some((role) => user.role === role);
      console.log('✅ ¿El usuario tiene el rol requerido?:', hasRole);

      if (!hasRole) {
        throw new ForbiddenException(
          'No tienes permisos para acceder a esta ruta',
        );
      }

      return true;
    } catch (error) {
      console.error('💥 Error dentro del RolesGuard:', error);
      throw new InternalServerErrorException(
        'Error en RolesGuard: ' + error.message,
      );
    }
  }
}
