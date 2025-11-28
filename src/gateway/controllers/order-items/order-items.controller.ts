import { Controller, Get, Param, Post, Body, Patch, Delete, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderItemDto } from '../../../orderItems/dto/createOrderItem.dto';
import { UpdateOrderItemDto } from '../../../orderItems/dto/updateOrderItem.dto';
import { Roles } from '../../decorators/roles.decorator';

@ApiTags('OrderItems')
@ApiBearerAuth()
@Controller('order-items')
export class OrderItemsController {
  constructor(@Inject('ORDER_ITEMS_SERVICE') private readonly orderItemsClient: ClientProxy) {}

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'List all order items (Admin only)' })
  @ApiResponse({ status: 200, description: 'Array of order items returned.' })
  findAll() {
    return this.orderItemsClient.send({ cmd: 'orderItems.findAll' }, {});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order item by id' })
  @ApiResponse({ status: 200, description: 'Order item found.' })
  findOne(@Param('id') id: string) {
    return this.orderItemsClient.send({ cmd: 'orderItems.findOne' }, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create order item' })
  @ApiResponse({ status: 201, description: 'Order item created.' })
  create(@Body() dto: CreateOrderItemDto) {
    return this.orderItemsClient.send({ cmd: 'orderItems.create' }, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order item' })
  @ApiResponse({ status: 200, description: 'Order item updated.' })
  update(@Param('id') id: string, @Body() dto: UpdateOrderItemDto) {
    return this.orderItemsClient.send({ cmd: 'orderItems.update' }, { id, dto });
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete order item (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order item removed.' })
  remove(@Param('id') id: string) {
    return this.orderItemsClient.send({ cmd: 'orderItems.remove' }, id);
  }
}
