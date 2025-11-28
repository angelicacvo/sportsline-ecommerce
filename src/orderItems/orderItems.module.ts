import { Module } from '@nestjs/common';
import { OrderItemsService } from './orderItems.service';
import { OrderItemsMessageController } from './orderItems.message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/orderItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem])],
  controllers: [OrderItemsMessageController],
  providers: [OrderItemsService],
})
export class OrderItemsModule {}
