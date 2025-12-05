import { Controller, Get, Param, Post, Body, Patch, Delete, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery, ApiParam, ApiHeader } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderItemDto } from '../../../orderItems/dto/createOrderItem.dto';
import { UpdateOrderItemDto } from '../../../orderItems/dto/updateOrderItem.dto';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';

@ApiTags('OrderItems')
@ApiBearerAuth()
@Controller('order-items')
export class OrderItemsController {
  constructor(@Inject('ORDER_ITEMS_SERVICE') private readonly orderItemsClient: ClientProxy) {}

  @Roles('admin')
  @Get()
  @ApiOperation({ 
    summary: 'List all order items (Admin only)',
    description: 'Retrieve a paginated list of all order items across all orders'
  })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of items to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of items to return' })
  @ApiQuery({ name: 'orderId', required: false, type: String, description: 'Filter by order ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of order items retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '1',
            orderId: '1',
            productId: '1',
            quantity: 2,
            price: 125.00,
            total: 250.00,
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
    @Query('orderId') orderId?: string,
  ) {
    return this.orderItemsClient.send({ cmd: 'orderItems.findAll' }, { skip, take, orderId });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get order item by ID',
    description: 'Retrieve detailed information about a specific order item'
  })
  @ApiParam({ name: 'id', type: String, description: 'Order Item ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order item found',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          orderId: '1',
          productId: '1',
          quantity: 2,
          price: 125.00,
          total: 250.00,
          discount: 0,
          tax: 20.00,
          productSnapshot: {
            id: '1',
            name: 'Nike Running Shoes',
            description: 'High-performance shoes'
          },
          createdAt: '2025-11-27T21:00:00.000Z'
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Order item not found' })
  findOne(@Param('id') id: string) {
    return this.orderItemsClient.send({ cmd: 'orderItems.findOne' }, id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Add item to order',
    description: 'Create a new order item. Automatically decreases product inventory.'
  })
  @ApiBody({
    type: CreateOrderItemDto,
    examples: {
      example1: {
        value: {
          orderId: '1',
          productId: '1',
          quantity: 2,
          price: 125.00
        }
      },
      example2: {
        value: {
          orderId: '1',
          productId: '2',
          quantity: 1,
          price: 99.99,
          discount: 10,
          tax: 5
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Order item created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          orderId: '1',
          productId: '1',
          quantity: 2,
          total: 250.00,
          createdAt: '2025-11-27T21:00:00.000Z'
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Insufficient product inventory' })
  create(@Body() dto: CreateOrderItemDto) {
    return this.orderItemsClient.send({ cmd: 'orderItems.create' }, dto);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update order item',
    description: 'Update order item quantity or other details. Inventory is automatically adjusted.'
  })
  @ApiParam({ name: 'id', type: String, description: 'Order Item ID' })
  @ApiBody({
    type: UpdateOrderItemDto,
    examples: {
      example1: {
        value: {
          quantity: 3
        }
      },
      example2: {
        value: {
          discount: 15
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order item updated successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          quantity: 3,
          total: 375.00,
          updatedAt: '2025-11-27T21:05:00.000Z'
        },
        timestamp: '2025-11-27T21:05:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Order item not found' })
  @ApiResponse({ status: 409, description: 'Insufficient product inventory for quantity change' })
  update(@Param('id') id: string, @Body() dto: UpdateOrderItemDto, @CurrentUser('userId') userId?: number) {
    return this.orderItemsClient.send({ cmd: 'orderItems.update' }, { id, dto, userId });
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Remove item from order (Admin only)',
    description: 'Delete an order item and restore product inventory'
  })
  @ApiParam({ name: 'id', type: String, description: 'Order Item ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order item deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Order item deleted successfully',
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Order item not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  remove(@Param('id') id: string) {
    return this.orderItemsClient.send({ cmd: 'orderItems.remove' }, id);
  }
}
