import { Controller, Get, Param, Post, Body, Patch, Delete, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from '../../../orders/dto/createOrder.dto';
import { UpdateOrderDto } from '../../../orders/dto/updateOrder.dto';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(@Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy) {}

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'List all orders (Admin only)' })
  @ApiResponse({ status: 200, description: 'Array of orders returned.' })
  findAll() {
    return this.ordersClient.send({ cmd: 'orders.findAll' }, {});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  @ApiResponse({ status: 200, description: 'Order found.' })
  findOne(@Param('id') id: string, @CurrentUser('userId') userId: number) {
    return this.ordersClient.send({ cmd: 'orders.findOne' }, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create order' })
  @ApiResponse({ status: 201, description: 'Order created.' })
  create(@Body() dto: CreateOrderDto, @CurrentUser('userId') userId: number) {
    return this.ordersClient.send({ cmd: 'orders.create' }, { ...dto, userId });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order' })
  @ApiResponse({ status: 200, description: 'Order updated.' })
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto, @CurrentUser('userId') userId: number) {
    return this.ordersClient.send({ cmd: 'orders.update' }, { id, dto, userId });
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete order (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order removed.' })
  remove(@Param('id') id: string) {
    return this.ordersClient.send({ cmd: 'orders.remove' }, id);
  }
}
