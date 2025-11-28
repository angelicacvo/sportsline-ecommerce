import { Module } from '@nestjs/common';
import { DatabaseModule } from '../libs/database/database.module';
import { UsersModule } from './users.module';
import { User } from './entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { OrderItem } from '../orderItems/entities/orderItem.entity';

@Module({
  imports: [
    DatabaseModule.forRoot({
      entities: [User, Order, Product, Category, OrderItem],
    }),
    UsersModule,
  ],
})
export class UsersAppModule {}
