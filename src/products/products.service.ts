import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dto/createProduct.dto";
import { UpdateProductDto } from "./dto/updateProduct.dto";
import { Product } from "./entities/product.entity";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create({
      ...createProductDto,
      category: { id: String(createProductDto.categoryId) },
    });
    try {
      return await this.productRepository.save(product);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Product title already exists');
      }
      throw error;
    }
  }

  findAll() {
    return this.productRepository.find();
  }

  findOne(id: string) {
    return this.productRepository.findOne({ where: { id } });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    const productUpdate = this.productRepository.update( id, updateProductDto);
    return productUpdate;
  }

  remove(id: string) {
    return this.productRepository.delete(id);
  }
}
