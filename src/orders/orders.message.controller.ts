import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/createOrder.dto';
import { UpdateOrderDto } from './dto/updateOrder.dto';

@Controller()
export class OrdersMessageController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'orders.create' })
  create(@Payload() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @MessagePattern({ cmd: 'orders.findAll' })
  findAll() {
    return this.ordersService.findAll();
  }

  @MessagePattern({ cmd: 'orders.findOne' })
  findOne(@Payload() id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern({ cmd: 'orders.update' })
  update(@Payload() payload: { id: string; dto: UpdateOrderDto }) {
    return this.ordersService.update(payload.id, payload.dto);
  }

  @MessagePattern({ cmd: 'orders.remove' })
  remove(@Payload() id: string) {
    return this.ordersService.remove(id);
  }
}