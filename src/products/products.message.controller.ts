import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';

@Controller()
export class ProductsMessageController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'products.create' })
  create(@Payload() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @MessagePattern({ cmd: 'products.findAll' })
  findAll() {
    return this.productsService.findAll();
  }

  @MessagePattern({ cmd: 'products.findOne' })
  findOne(@Payload() id: string) {
    return this.productsService.findOne(id);
  }

  @MessagePattern({ cmd: 'products.update' })
  update(@Payload() payload: { id: string; dto: UpdateProductDto }) {
    return this.productsService.update(payload.id, payload.dto);
  }

  @MessagePattern({ cmd: 'products.remove' })
  remove(@Payload() id: string) {
    return this.productsService.remove(id);
  }
}