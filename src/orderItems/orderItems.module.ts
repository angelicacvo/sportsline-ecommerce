import { Module } from '@nestjs/common';
import { OrderItemsService } from './orderItems.service';
import { OrderItemsController } from './orderItems.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/orderItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem])],
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
})
export class OrderItemsModule {}
