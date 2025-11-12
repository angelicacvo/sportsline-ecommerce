import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// 🧩 Módulos de tu app
import { UsersModule } from './users/user.module';
import { ProductsModule } from './products/product.module';
import { ClientsModule } from './clients/client.module';
import { OrdersModule } from './orders/order.module';

// 🧩 Entidades
import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { Client } from './clients/client.entity';
import { Order } from './orders/order.entity';

// 🧩 Middleware temporal de autenticación simulada
import { FakeUserMiddleware } from './common/middleware/fake-user.middleware';

@Module({
  imports: [
    // 🔹 Configuración global del archivo .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 🔹 Conexión a la base de datos PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User, Product, Client, Order],
      synchronize: true, // ⚠️ Úsalo solo en desarrollo
    }),

    // 🔹 Módulos principales
    UsersModule,
    ProductsModule,
    ClientsModule,
    OrdersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplica el middleware que inyecta un usuario falso a todas las rutas
    consumer.apply(FakeUserMiddleware).forRoutes('*');
  }
}
