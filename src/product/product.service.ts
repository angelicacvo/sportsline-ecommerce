import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    let seller: User | null = null;
    if (createProductDto.userId) {
      seller = await this.userRepo.findOne({ where: { id: createProductDto.userId.toString() } });
      if (!seller) throw new BadRequestException('User not found');
    }
    const product = this.productRepo.create({
      code: createProductDto.code,
      name: createProductDto.name,
      description: createProductDto.description,
      price: createProductDto.price,
      stock: createProductDto.stock,
      seller: seller ?? undefined,
    });
    return this.productRepo.save(product);
  }  findAll() {
    return this.productRepo.find({ relations: ['seller'] });
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({ where: { id: id.toString() }, relations: ['seller'] });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepo.findOne({ where: { id: id.toString() }, relations: ['seller'] });
    if (!product) throw new NotFoundException('Product not found');

    if (updateProductDto['userId']) {
      const seller = await this.userRepo.findOne({ where: { id: updateProductDto['userId'].toString() } });
      if (!seller) throw new BadRequestException('User not found');
      Object.assign(product, { seller });
    }
    Object.assign(product, updateProductDto);
    return this.productRepo.save(product);
  }

  async remove(id: number) {
    const product = await this.productRepo.findOne({ where: { id: id.toString() } });
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepo.remove(product);
    return { message: 'Product removed successfully' };
  }
}
