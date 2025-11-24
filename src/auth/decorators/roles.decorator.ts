import { SetMetadata } from '@nestjs/common';

/**
 * ROLES_KEY - Identificador único para almacenar información de roles
 */
export const ROLES_KEY = 'roles';

/**
 * @Roles Decorator - Almacena qué roles pueden acceder a una ruta
 * 
 * CAMBIO IMPORTANTE:
 * Antes: @Roles(UserRole.ADMIN, UserRole.SELLER) ← Usaba enum ❌
 * Ahora: @Roles('admin', 'seller') ← Usa strings desde BD ✅
 * 
 * CÓMO FUNCIONA:
 * 1. Escribes: @Roles('admin', 'seller')
 * 2. El decorador guarda: { 'roles': ['admin', 'seller'] }
 * 3. RolesGuard lee estos nombres y verifica contra user.role.name de BD
 * 
 * EJEMPLOS:
 * @Roles('admin')              ← Solo admin
 * @Roles('admin', 'seller')    ← Admin O seller
 * @Roles('customer')           ← Solo customer
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
