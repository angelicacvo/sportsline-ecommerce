import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/user.module';
import { ProductsModule } from './products/product.module';
import { ClientsModule } from './clients/client.module';
import { OrdersModule } from './orders/order.module';

import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { Client } from './clients/client.entity';
import { Order } from './orders/order.entity';

import { FakeUserMiddleware } from './common/middleware/fake-user.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User, Product, Client, Order],
      synchronize: true,
    }),

    UsersModule,
    ProductsModule,
    ClientsModule,
    OrdersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FakeUserMiddleware).forRoutes('*');
  }
}
