import { Controller, Get, Param, Post, Body, Patch, Delete, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery, ApiParam, ApiHeader } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { CreateCategoryDto } from '../../../categories/dto/createCategory.dto';
import { UpdateCategoryDto } from '../../../categories/dto/updateCategory.dto';
import { Public } from '../../decorators/public.decorator';
import { Roles } from '../../decorators/roles.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(@Inject('CATEGORIES_SERVICE') private readonly categoriesClient: ClientProxy) {}

  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Get all categories',
    description: 'Retrieve a list of all product categories with optional filtering'
  })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of categories to skip' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of categories to return' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by category name' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of categories retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '1',
            name: 'Shoes',
            description: 'Running and athletic shoes',
            parent: null,
            productCount: 15,
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
  ) {
    return this.categoriesClient.send({ cmd: 'categories.findAll' }, { skip, take, search });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get category by ID',
    description: 'Retrieve detailed information about a specific category'
  })
  @ApiParam({ name: 'id', type: String, description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Category found',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          name: 'Shoes',
          description: 'Running and athletic shoes',
          parent: null,
          children: [
            { id: '2', name: 'Running Shoes' },
            { id: '3', name: 'Basketball Shoes' }
          ],
          productCount: 15,
          image: null,
          icon: null,
          createdAt: '2025-11-27T21:00:00.000Z'
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string) {
    return this.categoriesClient.send({ cmd: 'categories.findOne' }, id);
  }

  @Roles('admin')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ 
    summary: 'Create category (Admin only)',
    description: 'Create a new product category with optional parent category for hierarchy'
  })
  @ApiBody({
    type: CreateCategoryDto,
    examples: {
      root: {
        value: {
          name: 'Shoes',
          description: 'Running and athletic shoes'
        }
      },
      child: {
        value: {
          name: 'Running Shoes',
          description: 'High-performance running shoes',
          parentId: '1'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Category created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          name: 'Shoes',
          description: 'Running and athletic shoes',
          createdAt: '2025-11-27T21:00:00.000Z'
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
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesClient.send({ cmd: 'categories.create' }, dto);
  }

  @Roles('admin')
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update category (Admin only)',
    description: 'Update category information'
  })
  @ApiParam({ name: 'id', type: String, description: 'Category ID' })
  @ApiBody({
    type: UpdateCategoryDto,
    examples: {
      example1: {
        value: {
          name: 'Updated Category Name',
          description: 'Updated description'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Category updated successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '1',
          name: 'Updated Category Name',
          description: 'Updated description'
        },
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesClient.send({ cmd: 'categories.update' }, { id, dto });
  }

  @Roles('admin')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete category (Admin only)',
    description: 'Delete a product category'
  })
  @ApiParam({ name: 'id', type: String, description: 'Category ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Category deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Category deleted successfully',
        timestamp: '2025-11-27T21:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  remove(@Param('id') id: string) {
    return this.categoriesClient.send({ cmd: 'categories.remove' }, id);
  }
}
