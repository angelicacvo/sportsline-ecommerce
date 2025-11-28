import { Controller, Get, Param, Post, Body, Patch, Delete, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'List products' })
  @ApiResponse({ status: 200, description: 'Array of products returned.' })
  findAll() {
    return this.productsClient.send({ cmd: 'products.findAll' }, {});
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse({ status: 200, description: 'Product found.' })
  findOne(@Param('id') id: string) {
    return this.productsClient.send({ cmd: 'products.findOne' }, id);
  }

  @Roles('admin')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created.' })
  create(@Body() dto: CreateProductDto) {
    return this.productsClient.send({ cmd: 'products.create' }, dto);
  }

  @Roles('admin')
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product updated.' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsClient.send({ cmd: 'products.update' }, { id, dto });
  }

  @Roles('admin')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product removed.' })
  remove(@Param('id') id: string) {
    return this.productsClient.send({ cmd: 'products.remove' }, id);
  }
}
