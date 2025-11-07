import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async findAll(): Promise<Order[]> {
    return await this.orderRepo.find({
      relations: ['client', 'product'],
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['client', 'product'],
    });
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
  }

  async create(data: Partial<Order>): Promise<Order> {
    const order = this.orderRepo.create(data);
    return await this.orderRepo.save(order);
  }

  async update(id: number, data: Partial<Order>): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, data);
    return await this.orderRepo.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepo.remove(order);
  }
}
