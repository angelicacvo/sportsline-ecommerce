import { Controller, Get, Param, Post, Body, Patch, Delete, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery, ApiParam, ApiHeader } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { CreateProductDto } from '../../../products/dto/createProduct.dto';
import { UpdateProductDto } from '../../../products/dto/updateProduct.dto';
import { Public } from '../../decorators/public.decorator';
import { Roles } from '../../decorators/roles.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(@Inject('PRODUCTS_SERVICE') private readonly productsClient: ClientProxy) {}

  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Get all products',
    description: 'Retrieve a paginated list of all products. Supports filtering by category, search, and sorting.'
  })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of products to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of products to return' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by product name' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category ID' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Minimum price filter' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Maximum price filter' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of products retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '1',
            name: 'Nike Running Shoes',
            description: 'High-performance running shoes',
            price: 120.00,
            stock: 50,
            category: { id: '1', name: 'Shoes' },
            createdAt: '2025-11-27T21:00:00.000Z'
          }
        ],
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productsClient.send({ cmd: 'products.findAll' }, { skip, take, search, categoryId });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get product by ID',
    description: 'Retrieve detailed information about a specific product'
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Product found',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          name: 'Nike Running Shoes',
          description: 'High-performance running shoes',
          price: 120.00,
          stock: 50,
          category: { id: '1', name: 'Shoes' },
          images: [{ url: 'https://example.com/image.jpg' }],
          createdAt: '2025-11-27T21:00:00.000Z'
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Product not found',
    schema: {
      example: {
        success: false,
        message: 'Product not found',
        statusCode: 404
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.productsClient.send({ cmd: 'products.findOne' }, id);
  }

  @Roles('admin')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ 
    summary: 'Create product (Admin only)',
    description: 'Create a new product. Requires admin role.'
  })
  @ApiBody({
    type: CreateProductDto,
    examples: {
      example1: {
        value: {
          name: 'Nike Running Shoes',
          description: 'High-performance running shoes',
          price: 120.00,
          stock: 50,
          categoryId: '1',
          images: [{ url: 'https://example.com/image.jpg' }]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Product created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          name: 'Nike Running Shoes',
          price: 120.00,
          stock: 50
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiHeader({
    name: 'Authorization',
    description: 'JWT Bearer token with admin role',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  create(@Body() dto: CreateProductDto) {
    return this.productsClient.send({ cmd: 'products.create' }, dto);
  }

  @Roles('admin')
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update product (Admin only)',
    description: 'Update product information. Requires admin role.'
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiBody({
    type: UpdateProductDto,
    examples: {
      example1: {
        value: {
          name: 'Updated Product Name',
          price: 150.00,
          stock: 100
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Product updated successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          name: 'Updated Product Name',
          price: 150.00,
          stock: 100
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsClient.send({ cmd: 'products.update' }, { id, dto });
  }

  @Roles('admin')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete product (Admin only)',
    description: 'Delete a product. Requires admin role.'
  })
  @ApiParam({ name: 'id', type: String, description: 'Product ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Product deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Product deleted successfully',
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  remove(@Param('id') id: string) {
    return this.productsClient.send({ cmd: 'products.remove' }, id);
  }
}
