import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../role/entities/role.entity';
import * as bcrypt from 'bcrypt';

/**
 * USER SEEDER
 * 
 * Crea usuarios de prueba con roles desde BD:
 * - 1 Admin
 * - 3 Sellers
 * - 6 Customers
 */
export default class UserSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<void> {
        const userRepo = dataSource.getRepository(User);
        const roleRepo = dataSource.getRepository(Role);

        console.log('👤 Seeding users...');

        // Obtener roles de BD
        const adminRole = await roleRepo.findOne({ where: { name: 'admin' } });
        const sellerRole = await roleRepo.findOne({ where: { name: 'seller' } });
        const customerRole = await roleRepo.findOne({ where: { name: 'customer' } });

        if (!adminRole || !sellerRole || !customerRole) {
            throw new Error('Roles not found! Run RoleSeeder first.');
        }

        // CREAR 1 ADMIN
        const admin = userRepo.create({
            username: 'admin',
            email: 'admin@example.com',
            password: await bcrypt.hash('admin123', 10),
            role: adminRole
        });
        await userRepo.save(admin);
        console.log('  ✅ Created admin user');

        // CREAR 3 SELLERS
        for (let i = 1; i <= 3; i++) {
            const seller = userRepo.create({
                username: `seller${i}`,
                email: `seller${i}@example.com`,
                password: await bcrypt.hash('password123', 10),
                role: sellerRole
            });
            await userRepo.save(seller);
        }
        console.log('  ✅ Created 3 seller users');

        // CREAR 6 CUSTOMERS
        for (let i = 1; i <= 6; i++) {
            const customer = userRepo.create({
                username: `customer${i}`,
                email: `customer${i}@example.com`,
                password: await bcrypt.hash('password123', 10),
                role: customerRole
            });
            await userRepo.save(customer);
        }
        console.log('  ✅ Created 6 customer users');
        
        console.log('✅ Users seeded successfully!\n');
    }
}
