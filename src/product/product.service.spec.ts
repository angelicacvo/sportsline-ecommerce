import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Repository<Product>;
  let userRepository: Repository<User>;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product with a seller', async () => {
      const createDto = {
        code: 'PROD001',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        stock: 50,
        userId: 1,
      };

      const mockSeller = {
        id: '1',
        username: 'seller1',
        email: 'seller@test.com',
        password: 'pass',
        role: 'seller',
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      };

      const expectedProduct = {
        id: '1',
        code: createDto.code,
        name: createDto.name,
        description: createDto.description,
        price: createDto.price,
        stock: createDto.stock,
        seller: mockSeller,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [],
      };

      mockUserRepository.findOne.mockResolvedValue(mockSeller);
      mockProductRepository.create.mockReturnValue(expectedProduct);
      mockProductRepository.save.mockResolvedValue(expectedProduct);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedProduct);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it('should create a product without a seller', async () => {
      const createDto = {
        code: 'PROD001',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        stock: 50,
      };

      const expectedProduct = {
        id: '1',
        ...createDto,
        seller: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [],
      };

      mockProductRepository.create.mockReturnValue(expectedProduct);
      mockProductRepository.save.mockResolvedValue(expectedProduct);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedProduct);
      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if userId does not exist', async () => {
      const createDto = {
        code: 'PROD001',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        stock: 50,
        userId: 999,
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow('User not found');

      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const expectedProducts = [
        {
          id: '1',
          code: 'PROD001',
          name: 'Product 1',
          description: 'Description 1',
          price: 100,
          stock: 50,
          seller: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          orderItems: [],
        },
      ];

      mockProductRepository.find.mockResolvedValue(expectedProducts);

      const result = await service.findAll();

      expect(result).toEqual(expectedProducts);
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        relations: ['seller'],
      });
    });

    it('should return empty array if no products exist', async () => {
      mockProductRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const expectedProduct = {
        id: '1',
        code: 'PROD001',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        stock: 50,
        seller: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [],
      };

      mockProductRepository.findOne.mockResolvedValue(expectedProduct);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedProduct);
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['seller'],
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Product not found');
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const updateDto = {
        name: 'Product Updated',
        price: 150,
      };

      const existingProduct = {
        id: '1',
        code: 'PROD001',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        stock: 50,
        seller: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [],
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateDto,
      };

      mockProductRepository.findOne.mockResolvedValue(existingProduct);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateDto);

      expect(result.name).toBe('Product Updated');
      expect(result.price).toBe(150);
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product to update not found', async () => {
      const updateDto = { name: 'Product Updated' };

      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        'Product not found',
      );

      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if updating to non-existent userId', async () => {
      const updateDto = {
        userId: 999,
      };

      const existingProduct = {
        id: '1',
        code: 'PROD001',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        stock: 50,
        seller: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [],
      };

      mockProductRepository.findOne.mockResolvedValue(existingProduct);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        'User not found',
      );

      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a product successfully', async () => {
      const productToRemove = {
        id: '1',
        code: 'PROD001',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        stock: 50,
        seller: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [],
      };

      mockProductRepository.findOne.mockResolvedValue(productToRemove);
      mockProductRepository.remove.mockResolvedValue(productToRemove);

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Product removed successfully' });
      expect(mockProductRepository.remove).toHaveBeenCalledWith(productToRemove);
    });

    it('should throw NotFoundException if product to remove not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow('Product not found');

      expect(mockProductRepository.remove).not.toHaveBeenCalled();
    });
  });
});
