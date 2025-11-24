import { DataSource } from 'typeorm';
import { Role } from '../../role/entities/role.entity';
import { Permission } from '../../permission/entities/permission.entity';

/**
 * ROLE SEEDER
 * 
 * Crea 3 roles y les asigna permisos específicos:
 * 
 * 1. ADMIN: Acceso total (todos los permisos)
 * 2. SELLER: Puede gestionar productos y ver órdenes
 * 3. CUSTOMER: Solo puede ver productos y crear órdenes
 */
export class RoleSeeder {
    async run(dataSource: DataSource): Promise<void> {
        const roleRepo = dataSource.getRepository(Role);
        const permissionRepo = dataSource.getRepository(Permission);

        console.log('👥 Seeding roles...');

        // ===============================
        // 1. ROL: ADMIN (Acceso total)
        // ===============================
        let adminRole = await roleRepo.findOne({ 
            where: { name: 'admin' },
            relations: ['permissions']
        });

        if (!adminRole) {
            adminRole = roleRepo.create({
                name: 'admin',
                description: 'Administrador con acceso total al sistema'
            });
            
            // ADMIN tiene TODOS los permisos
            const allPermissions = await permissionRepo.find();
            adminRole.permissions = allPermissions;
            
            await roleRepo.save(adminRole);
            console.log(`  ✅ Created role: admin (${allPermissions.length} permissions)`);
        } else {
            console.log('  ⏭️  Role already exists: admin');
        }

        // ===============================
        // 2. ROL: SELLER (Vendedor)
        // ===============================
        let sellerRole = await roleRepo.findOne({ 
            where: { name: 'seller' },
            relations: ['permissions']
        });

        if (!sellerRole) {
            sellerRole = roleRepo.create({
                name: 'seller',
                description: 'Vendedor que gestiona productos'
            });

            // SELLER puede: gestionar productos, ver órdenes
            const sellerPermissions = await permissionRepo.find({
                where: [
                    { name: 'create:product' },
                    { name: 'read:product' },
                    { name: 'update:product' },
                    { name: 'delete:product' },
                    { name: 'read:order' },
                ]
            });
            sellerRole.permissions = sellerPermissions;
            
            await roleRepo.save(sellerRole);
            console.log(`  ✅ Created role: seller (${sellerPermissions.length} permissions)`);
        } else {
            console.log('  ⏭️  Role already exists: seller');
        }

        // ===============================
        // 3. ROL: CUSTOMER (Cliente)
        // ===============================
        let customerRole = await roleRepo.findOne({ 
            where: { name: 'customer' },
            relations: ['permissions']
        });

        if (!customerRole) {
            customerRole = roleRepo.create({
                name: 'customer',
                description: 'Cliente que puede comprar productos'
            });

            // CUSTOMER puede: ver productos, crear/ver sus órdenes
            const customerPermissions = await permissionRepo.find({
                where: [
                    { name: 'read:product' },
                    { name: 'create:order' },
                    { name: 'read:order' },
                ]
            });
            customerRole.permissions = customerPermissions;
            
            await roleRepo.save(customerRole);
            console.log(`  ✅ Created role: customer (${customerPermissions.length} permissions)`);
        } else {
            console.log('  ⏭️  Role already exists: customer');
        }

        console.log('✅ Roles seeded successfully!\n');
    }
}
