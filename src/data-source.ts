import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Client } from './clients/client.entity';
import { Product } from './products/product.entity';
import { Order } from './orders/order.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1234',
  database: 'riwi_sportsline',
  entities: [User, Client, Product, Order],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
