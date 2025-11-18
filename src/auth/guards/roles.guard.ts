import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';

/**
 * RolesGuard - Verifies if the user has the required role to access a route
 * 
 * How it works:
 * 1. Reads what roles are allowed (from @Roles decorator)
 * 2. Gets the user's role (from the request, set by AuthGuard)
 * 3. Compares: Does the user have one of the allowed roles?
 * 4. If yes → allow access, if no → block access (403)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector: A tool to read metadata (information stored in decorators)
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // STEP 1: Read which roles are allowed for this route
    // Example: @Roles(UserRole.ADMIN, UserRole.SELLER) → requiredRoles = [UserRole.ADMIN, UserRole.SELLER]
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // Check the method (e.g., adminOnly())
      context.getClass(),   // Check the controller (e.g., @Controller)
    ]);

    // STEP 2: If the route has no @Roles decorator, allow anyone (authenticated)
    if (!requiredRoles) {
      return true;
    }

    // STEP 3: Get the logged-in user from the request
    // AuthGuard already added user to request: req.user = { id, email, role }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // STEP 4: Check if user's role matches any of the required roles
    // Example: user.role = UserRole.ADMIN, requiredRoles = [UserRole.ADMIN, UserRole.SELLER] → ✅ true
    // Example: user.role = UserRole.CUSTOMER, requiredRoles = [UserRole.ADMIN] → ❌ false
    const hasRole = requiredRoles.some((role) => user.role === role);

    // STEP 5: If user doesn't have the required role, block access
    if (!hasRole) {
      throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
    }

    // ✅ User has the required role, allow access
    return true;
  }
} 
