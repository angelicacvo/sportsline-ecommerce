import 'reflect-metadata';
import { dataSource } from './data-source';
import { runSeeders } from 'typeorm-extension';
import { join } from 'path';
import MainSeeder from './seeds/main.seeder';
// Ensure factories are registered by importing them explicitly
import './factories/user.factory';
import './factories/client.factory';
import './factories/product.factory';
import './factories/order.factory';
import './factories/order-item.factory';

async function bootstrap() {
  try {
    await dataSource.initialize();
    await runSeeders(dataSource, {
      seeds: [MainSeeder],
      factories: [join(__dirname, 'factories/*{.ts,.js}')],
    });
    console.log('✅ Seeding completed successfully');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

bootstrap();
