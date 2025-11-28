import { Injectable, Inject } from '@nestjs/common';
import { CreateOrderDto } from './dto/createOrder.dto';
import { UpdateOrderDto } from './dto/updateOrder.dto';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @Inject('USERS_SERVICE') private usersClient: ClientProxy,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    // Example: Validate user exists using microservice communication
    try {
      const user = await firstValueFrom(
        this.usersClient.send({ cmd: 'users.findOne' }, createOrderDto.userId),
      );
      
      if (!user) {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error validating user:', error);
      // Continue with order creation even if validation fails (for now)
    }

    const order = this.orderRepository.create({
      ...createOrderDto,
      user: { id: createOrderDto.userId },
    });
    return this.orderRepository.save(order);
  }

  findAll() {
    return this.orderRepository.find();
  }

  findOne(id: string) {
    return this.orderRepository.findOne({ where: { id } });
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.orderRepository.update(id, updateOrderDto);
  }

  remove(id: string) {
    return this.orderRepository.delete(id);
  }
}
