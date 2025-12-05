import { Controller, Get, Param, Post, Body, Patch, Delete, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery, ApiParam, ApiHeader } from '@nestjs/swagger';
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
  @ApiOperation({ 
    summary: 'List all orders (Admin only)',
    description: 'Retrieve a paginated list of all orders with optional filtering by status and date'
  })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of orders to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of orders to return' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by order status (pending, confirmed, shipped, delivered)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter from date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter to date (YYYY-MM-DD)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of orders retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '1',
            userId: '1',
            status: 'pending',
            total: 250.00,
            items: 2,
            createdAt: '2025-11-27T21:00:00.000Z'
          }
        ],
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT Bearer token with admin role',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.ordersClient.send({ cmd: 'orders.findAll' }, { skip, take, status, startDate, endDate });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get order by ID',
    description: 'Retrieve detailed information about a specific order. Users can only view their own orders.'
  })
  @ApiParam({ name: 'id', type: String, description: 'Order ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order found',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          userId: '1',
          status: 'pending',
          shippingAddress: '123 Main St, City, State',
          total: 250.00,
          items: [
            {
              id: '1',
              productId: '1',
              quantity: 2,
              price: 125.00,
              total: 250.00
            }
          ],
          createdAt: '2025-11-27T21:00:00.000Z'
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot access other user orders' })
  findOne(@Param('id') id: string, @CurrentUser('userId') userId: number) {
    return this.ordersClient.send({ cmd: 'orders.findOne' }, { id, userId });
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create order',
    description: 'Create a new order with items and shipping address'
  })
  @ApiBody({
    type: CreateOrderDto,
    examples: {
      example1: {
        value: {
          shippingAddress: '123 Main St, City, State 12345',
          items: [
            {
              productId: '1',
              quantity: 2,
              price: 125.00
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Order created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          userId: '1',
          status: 'pending',
          total: 250.00,
          createdAt: '2025-11-27T21:00:00.000Z'
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  create(@Body() dto: CreateOrderDto, @CurrentUser('userId') userId: number) {
    return this.ordersClient.send({ cmd: 'orders.create' }, { ...dto, userId });
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update order',
    description: 'Update order status. Users can update their own orders; admins can update any order.'
  })
  @ApiParam({ name: 'id', type: String, description: 'Order ID' })
  @ApiBody({
    type: UpdateOrderDto,
    examples: {
      example1: {
        value: {
          status: 'confirmed'
        }
      },
      example2: {
        value: {
          status: 'shipped'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order updated successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          status: 'confirmed',
          updatedAt: '2025-11-27T21:05:00.000Z'
        },
        timestamp: '2025-11-27T21:05:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot update other user orders' })
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto, @CurrentUser('userId') userId: number) {
    return this.ordersClient.send({ cmd: 'orders.update' }, { id, dto, userId });
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete order (Admin only)',
    description: 'Permanently delete an order'
  })
  @ApiParam({ name: 'id', type: String, description: 'Order ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Order deleted successfully',
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  remove(@Param('id') id: string) {
    return this.ordersClient.send({ cmd: 'orders.remove' }, id);
  }
}
