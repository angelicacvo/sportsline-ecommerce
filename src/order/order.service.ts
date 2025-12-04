import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto, OrderStatusDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Client } from '../client/entities/client.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const client = await this.clientRepo.findOne({ where: { id: createOrderDto.clientId } });
    if (!client) throw new BadRequestException('Client not found');

    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }

    const items: OrderItem[] = [];
    let total = 0;

    for (const itemDto of createOrderDto.items) {
      const product = await this.productRepo.findOne({ where: { id: itemDto.productId } });
      if (!product) throw new BadRequestException(`Product ${itemDto.productId} not found`);
      const price = itemDto.price ?? product.price;
      const orderItem = this.orderItemRepo.create({
        product,
        quantity: itemDto.quantity,
        price,
      });
      total += price * itemDto.quantity;
      items.push(orderItem);
    }

    const mappedStatus: OrderStatus = createOrderDto.status
      ? (createOrderDto.status as OrderStatusDto) === OrderStatusDto.DELIVERED
        ? OrderStatus.DELIVERED
        : (createOrderDto.status as OrderStatusDto) === OrderStatusDto.CANCELLED
          ? OrderStatus.CANCELLED
          : OrderStatus.PENDING
      : OrderStatus.PENDING;

    const order = this.orderRepo.create({
      client: client as any, // allow relation assignment
      status: mappedStatus,
      total,
      items: items as any,
    });
    return this.orderRepo.save(order);
  }

  findAll() {
    return this.orderRepo.find({ relations: ['client', 'items', 'items.product'] });
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['client', 'items', 'items.product'] });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['client', 'items', 'items.product'] });
    if (!order) throw new NotFoundException('Order not found');
    // Only status change supported for now
    if (updateOrderDto['status']) {
      const s = updateOrderDto['status'] as OrderStatusDto;
      order.status = s === OrderStatusDto.DELIVERED
        ? OrderStatus.DELIVERED
        : s === OrderStatusDto.CANCELLED
          ? OrderStatus.CANCELLED
          : OrderStatus.PENDING;
    }
    return this.orderRepo.save(order);
  }

  async remove(id: number) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    await this.orderRepo.remove(order);
    return { message: 'Order removed successfully' };
  }
  
}
