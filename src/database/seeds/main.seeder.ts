import { Seeder, runSeeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { PermissionSeeder } from './permission.seeder';
import { RoleSeeder } from './role.seeder';
import UserSeeder from './user.seeder';
import ClientSeeder from './client.seeder';
import ProductSeeder from './product.seeder';
import OrderSeeder from './order.seeder';
import OrderItemSeeder from './order-item.seeder';

export default class MainSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    console.log('🌱 Starting database seeding...\n');
    
    // ORDEN IMPORTANTE:
    // 1. Permisos primero (no dependen de nada)
    // 2. Roles segundo (dependen de permisos)
    // 3. Users tercero (dependen de roles)
    // 4. Resto de entidades
    
    await runSeeder(dataSource, PermissionSeeder);
    await runSeeder(dataSource, RoleSeeder);
    await runSeeder(dataSource, UserSeeder);
    await runSeeder(dataSource, ClientSeeder);
    await runSeeder(dataSource, ProductSeeder);
    await runSeeder(dataSource, OrderSeeder);
    await runSeeder(dataSource, OrderItemSeeder);
    
    console.log('🎉 Database seeding completed successfully!');
  }
}
