import { DataSource } from 'typeorm';
import { Permission } from '../../permission/entities/permission.entity';

/**
 * PERMISSION SEEDER
 * 
 * Crea los permisos básicos del sistema
 * Formato: "acción:recurso"
 * 
 * PERMISOS CREADOS:
 * - Usuarios: create:user, read:user, update:user, delete:user
 * - Productos: create:product, read:product, update:product, delete:product
 * - Clientes: create:client, read:client, update:client, delete:client
 * - Órdenes: create:order, read:order, update:order, delete:order
 */
export class PermissionSeeder {
    async run(dataSource: DataSource): Promise<void> {
        const permissionRepo = dataSource.getRepository(Permission);

        // Lista de permisos a crear
        const permissions = [
            // PERMISOS DE USUARIO
            { name: 'create:user', description: 'Crear nuevos usuarios' },
            { name: 'read:user', description: 'Ver información de usuarios' },
            { name: 'update:user', description: 'Actualizar usuarios existentes' },
            { name: 'delete:user', description: 'Eliminar usuarios' },

            // PERMISOS DE PRODUCTO
            { name: 'create:product', description: 'Crear nuevos productos' },
            { name: 'read:product', description: 'Ver productos' },
            { name: 'update:product', description: 'Actualizar productos' },
            { name: 'delete:product', description: 'Eliminar productos' },

            // PERMISOS DE CLIENTE
            { name: 'create:client', description: 'Crear nuevos clientes' },
            { name: 'read:client', description: 'Ver clientes' },
            { name: 'update:client', description: 'Actualizar clientes' },
            { name: 'delete:client', description: 'Eliminar clientes' },

            // PERMISOS DE ORDEN
            { name: 'create:order', description: 'Crear nuevas órdenes' },
            { name: 'read:order', description: 'Ver órdenes' },
            { name: 'update:order', description: 'Actualizar órdenes' },
            { name: 'delete:order', description: 'Eliminar órdenes' },
        ];

        console.log('🔐 Seeding permissions...');

        for (const permissionData of permissions) {
            // Verificar si ya existe
            const existing = await permissionRepo.findOne({ 
                where: { name: permissionData.name } 
            });

            if (!existing) {
                const permission = permissionRepo.create(permissionData);
                await permissionRepo.save(permission);
                console.log(`  ✅ Created permission: ${permissionData.name}`);
            } else {
                console.log(`  ⏭️  Permission already exists: ${permissionData.name}`);
            }
        }

        console.log('✅ Permissions seeded successfully!\n');
    }
}
