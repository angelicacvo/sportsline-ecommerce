import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RolesGuard - Verifica si el usuario tiene el rol necesario para acceder
 * 
 * CAMBIO IMPORTANTE:
 * ANTES: Comparábamos user.role (enum) con requiredRoles (enum) ❌
 * AHORA: Comparamos user.role.name (string de BD) con requiredRoles (strings) ✅
 * 
 * CÓMO FUNCIONA:
 * 1. Lee qué roles están permitidos (del decorador @Roles)
 * 2. Obtiene el rol del usuario desde request.user.role (objeto Role de BD)
 * 3. Compara: ¿El nombre del rol del usuario coincide con los permitidos?
 * 4. Si sí → permite acceso, si no → bloquea (403)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // PASO 1: Leer qué roles están permitidos para esta ruta
    // Ejemplo: @Roles('admin', 'seller') → requiredRoles = ['admin', 'seller']
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // PASO 2: Si la ruta no tiene @Roles, permitir acceso a cualquier autenticado
    if (!requiredRoles) {
      return true;
    }

    // PASO 3: Obtener el usuario autenticado del request
    // AuthGuard ya agregó el user: req.user = { sub: userId, email: userEmail, role: 'admin' }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // PASO 4: Verificar si el usuario tiene un rol
    if (!user || !user.role) {
      throw new ForbiddenException('User role not found');
    }

    // PASO 5: Comparar el rol del usuario con los roles permitidos
    // user.role es un string: 'admin', 'seller', 'customer'
    // Ejemplo: user.role = 'admin', requiredRoles = ['admin', 'seller'] → ✅ true
    const hasRole = requiredRoles.includes(user.role);

    // PASO 6: Si el usuario no tiene el rol requerido, bloquear acceso
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${user.role}`
      );
    }

    // ✅ Usuario tiene el rol requerido, permitir acceso
    return true;
  }
} 
