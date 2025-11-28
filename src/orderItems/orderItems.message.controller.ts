import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderItemsService } from './orderItems.service';
import { CreateOrderItemDto } from './dto/createOrderItem.dto';
import { UpdateOrderItemDto } from './dto/updateOrderItem.dto';

@Controller()
export class OrderItemsMessageController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @MessagePattern({ cmd: 'orderItems.create' })
  create(@Payload() dto: CreateOrderItemDto) {
    return this.orderItemsService.create(dto);
  }

  @MessagePattern({ cmd: 'orderItems.findAll' })
  findAll() {
    return this.orderItemsService.findAll();
  }

  @MessagePattern({ cmd: 'orderItems.findOne' })
  findOne(@Payload() id: string) {
    return this.orderItemsService.findOne(id);
  }

  @MessagePattern({ cmd: 'orderItems.update' })
  update(@Payload() payload: { id: string; dto: UpdateOrderItemDto }) {
    return this.orderItemsService.update(payload.id, payload.dto);
  }

  @MessagePattern({ cmd: 'orderItems.remove' })
  remove(@Payload() id: string) {
    return this.orderItemsService.remove(id);
  }
}