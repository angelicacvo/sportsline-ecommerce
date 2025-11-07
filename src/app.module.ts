import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/user.module';
import { ProductsModule } from './products/product.module';
import { ClientsModule } from './clients/client.module';
import { OrdersModule } from './orders/order.module'; // ✅ importa el módulo si ya lo tienes

// 👇 Importa también la entidad
import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { Client } from './clients/client.entity';
import { Order } from './orders/order.entity'; // ✅ importante

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User, Product, Client, Order], // ✅ agrega aquí
      synchronize: true,
    }),
    UsersModule,
    ProductsModule,
    ClientsModule,
    OrdersModule, // ✅ importa el módulo también
  ],
})
export class AppModule {}
