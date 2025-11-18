import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto = {
        code: 'PROD001',
        name: 'Product 1',
        description: 'Description 1',
        price: 100,
        stock: 50,
        userId: 1,
      };
      const expectedResult = {
        id: '1',
        ...createProductDto,
        seller: { id: '1', username: 'seller1' },
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [],
      };

      mockProductService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createProductDto);

      expect(result).toEqual(expectedResult);
      expect(mockProductService.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const expectedResult = [
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

      mockProductService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockProductService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const expectedResult = {
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

      mockProductService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(mockProductService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto = {
        name: 'Product Updated',
        price: 150,
      };
      const expectedResult = {
        id: '1',
        code: 'PROD001',
        name: 'Product Updated',
        description: 'Description 1',
        price: 150,
        stock: 50,
        seller: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: [],
      };

      mockProductService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateProductDto);

      expect(result).toEqual(expectedResult);
      expect(mockProductService.update).toHaveBeenCalledWith(1, updateProductDto);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const expectedResult = { message: 'Product removed successfully' };

      mockProductService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(result).toEqual(expectedResult);
      expect(mockProductService.remove).toHaveBeenCalledWith(1);
    });
  });
});
