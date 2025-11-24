import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(createOrderItemDto: CreateOrderItemDto) {
    const order = await this.orderRepo.findOne({ where: { id: createOrderItemDto.orderId } });
    if (!order) throw new BadRequestException('Order not found');
    const product = await this.productRepo.findOne({ where: { id: createOrderItemDto.productId } });
    if (!product) throw new BadRequestException('Product not found');
    const price = createOrderItemDto.price ?? product.price;
    const item = this.orderItemRepo.create({ order: order as any, product, quantity: createOrderItemDto.quantity, price });
    return this.orderItemRepo.save(item);
  }

  findAll() {
    return this.orderItemRepo.find({ relations: ['order', 'product'] });
  }

  async findOne(id: number) {
    const item = await this.orderItemRepo.findOne({ where: { id }, relations: ['order', 'product'] });
    if (!item) throw new NotFoundException('Order item not found');
    return item;
  }

  async update(id: number, updateOrderItemDto: UpdateOrderItemDto) {
    const item = await this.orderItemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Order item not found');
    Object.assign(item, updateOrderItemDto);
    return this.orderItemRepo.save(item);
  }

  async remove(id: number) {
    const item = await this.orderItemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Order item not found');
    await this.orderItemRepo.remove(item);
    return { message: 'Order item removed successfully' };
  }
  
}
