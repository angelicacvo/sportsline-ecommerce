import { Controller, Get, Param, Post, Body, Patch, Delete, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'List categories' })
  @ApiResponse({ status: 200, description: 'Array of categories returned.' })
  findAll() {
    return this.categoriesClient.send({ cmd: 'categories.findAll' }, {});
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get category by id' })
  @ApiResponse({ status: 200, description: 'Category found.' })
  findOne(@Param('id') id: string) {
    return this.categoriesClient.send({ cmd: 'categories.findOne' }, id);
  }

  @Roles('admin')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created.' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesClient.send({ cmd: 'categories.create' }, dto);
  }

  @Roles('admin')
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category updated.' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesClient.send({ cmd: 'categories.update' }, { id, dto });
  }

  @Roles('admin')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category removed.' })
  remove(@Param('id') id: string) {
    return this.categoriesClient.send({ cmd: 'categories.remove' }, id);
  }
}
