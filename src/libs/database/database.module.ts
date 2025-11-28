import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export interface DatabaseModuleOptions {
  entities: any[];
}

@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseModuleOptions): DynamicModule {
    // Load .env explicitly if present
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }

    const requiredVars = [
      'DATABASE_HOST',
      'DATABASE_PORT',
      'DATABASE_USER',
      'DATABASE_PASSWORD',
      'DATABASE_NAME',
    ];
    const missing = requiredVars.filter((v) => !process.env[v] || process.env[v] === '');
    if (missing.length) {
      throw new Error(
        `DatabaseModule error: faltan variables de entorno requeridas (${missing.join(', ')}). Asegura el archivo .env.`
      );
    }

    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST,
          port: +(process.env.DATABASE_PORT as string),
          username: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
          entities: options.entities,
          synchronize: true,
          retryAttempts: 10,
          retryDelay: 3000,
          autoLoadEntities: false,
        }),
      ],
    };
  }
}
