import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import MainSeeder from './seeds/main.seeder';

// Keep paths consistent with Nest DatabaseModule and typeorm-extension expectations
const sslEnabled = process.env.DB_SSL === 'true';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // Match app behavior; set to true if you rely on sync for local dev
  synchronize: true,
  ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  // typeorm-extension specific options (control seed order via MainSeeder)
  seeds: [MainSeeder],
  factories: [__dirname + '/factories/*{.ts,.js}'],
};

export const dataSource = new DataSource(options);

export default dataSource;
