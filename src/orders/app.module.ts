import { Module } from '@nestjs/common';
import { DatabaseModule } from '../libs/database/database.module';
import { OrdersModule } from './orders.module';
import { User } from '../users/entities/user.entity';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { OrderItem } from '../orderItems/entities/orderItem.entity';
import { ClientsModule } from '@nestjs/microservices';
import { MICROSERVICES_CONFIG } from '../microservices.config';

@Module({
  imports: [
    DatabaseModule.forRoot({
      entities: [User, Order, Product, Category, OrderItem],
    }),
    // Register Users Service client for inter-service communication
    ClientsModule.register([
      MICROSERVICES_CONFIG.USERS_SERVICE,
    ]),
    OrdersModule,
  ],
})
export class OrdersAppModule {}
