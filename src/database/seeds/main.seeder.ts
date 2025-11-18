import { Seeder, runSeeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import UserSeeder from './user.seeder';
import ClientSeeder from './client.seeder';
import ProductSeeder from './product.seeder';
import OrderSeeder from './order.seeder';
import OrderItemSeeder from './order-item.seeder';

export default class MainSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    // Ejecutar en orden correcto para respetar FKs y dependencias
    await runSeeder(dataSource, UserSeeder);
    await runSeeder(dataSource, ClientSeeder);
    await runSeeder(dataSource, ProductSeeder);
    await runSeeder(dataSource, OrderSeeder);
    await runSeeder(dataSource, OrderItemSeeder);
  }
}
