import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemsService } from './order-items.service';
import { OrderItemsController } from './order-items.controller';
import { OrderItem } from './entities/order-item.entity';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem, Order, Product])],
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
})
export class OrderItemsModule {}
