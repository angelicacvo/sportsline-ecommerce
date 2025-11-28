import { Module } from '@nestjs/common';
import { DatabaseModule } from '../libs/database/database.module';
import { ProductsModule } from './products.module';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { OrderItem } from '../orderItems/entities/orderItem.entity';

@Module({
  imports: [
    DatabaseModule.forRoot({
      entities: [User, Order, Product, Category, OrderItem],
    }),
    ProductsModule,
  ],
})
export class ProductsAppModule {}
