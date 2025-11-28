import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Controller()
export class CategoriesMessageController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @MessagePattern({ cmd: 'categories.create' })
  create(@Payload() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @MessagePattern({ cmd: 'categories.findAll' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @MessagePattern({ cmd: 'categories.findOne' })
  findOne(@Payload() id: string) {
    return this.categoriesService.findOne(id);
  }

  @MessagePattern({ cmd: 'categories.update' })
  update(@Payload() payload: { id: string; dto: UpdateCategoryDto }) {
    return this.categoriesService.update(payload.id, payload.dto);
  }

  @MessagePattern({ cmd: 'categories.remove' })
  remove(@Payload() id: string) {
    return this.categoriesService.remove(id);
  }
}