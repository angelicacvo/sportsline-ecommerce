import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../user/entities/user.entity';

/**
 * ROLES_KEY - A unique identifier to store/retrieve role information
 * Think of it like a label on a box: "roles" = the label, [UserRole.ADMIN, UserRole.CUSTOMER] = contents inside
 */
export const ROLES_KEY = 'roles';

/**
 * @Roles Decorator - Stores which roles are allowed to access a route
 * 
 * HOW IT WORKS:
 * When you write: @Roles(UserRole.ADMIN, UserRole.SELLER)
 * This decorator saves: { 'roles': ['admin', 'seller'] }
 * 
 * Later, RolesGuard reads this saved data using Reflector
 *  
 * Example usage in controller:
 * @Roles(UserRole.ADMIN)                    ← Only admin can access
 * @Roles(UserRole.ADMIN, UserRole.SELLER)   ← Admin OR seller can access
 * @Get('some-route')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
