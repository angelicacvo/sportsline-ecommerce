import { Module } from '@nestjs/common';
import { DatabaseModule } from '../libs/database/database.module';
import { OrderItemsModule } from './orderItems.module';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { OrderItem } from './entities/orderItem.entity';

@Module({
  imports: [
    DatabaseModule.forRoot({
      entities: [User, Order, Product, Category, OrderItem],
    }),
    OrderItemsModule,
  ],
})
export class OrderItemsAppModule {}
