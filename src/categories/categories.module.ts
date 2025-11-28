import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesMessageController } from './categories.message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesMessageController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
