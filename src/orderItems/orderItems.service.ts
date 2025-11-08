import { Injectable } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/createOrderItem.dto';
import { UpdateOrderItemDto } from './dto/updateOrderItem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/orderItem.entity';

@Injectable()
export class OrderItemsService {
  constructor(@InjectRepository(OrderItem) private orderItemRepository: Repository<OrderItem>) {}

  create(createOrderItemDto: CreateOrderItemDto) {
    const orderItem = this.orderItemRepository.create({
      ...createOrderItemDto,
      order: { id: createOrderItemDto.orderId },
      product: { id: createOrderItemDto.productId },
    } as any);
    return this.orderItemRepository.save(orderItem);
  }

  findAll() {
    return this.orderItemRepository.find();
  }

  findOne(id: string) {
    return this.orderItemRepository.findOne({ where: { id } });
  }

  update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
    const orderItemUpdate = this.orderItemRepository.update(id, updateOrderItemDto);
    return orderItemUpdate;
  }
  
  remove(id: string) {
    return this.orderItemRepository.delete(id);
  }
}
