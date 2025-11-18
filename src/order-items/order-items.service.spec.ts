import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderItemsService } from './order-items.service';
import { OrderItem } from './entities/order-item.entity';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { Repository } from 'typeorm';

describe('OrderItemsService', () => {
  let service: OrderItemsService;
  let orderItemRepository: Repository<OrderItem>;
  let orderRepository: Repository<Order>;
  let productRepository: Repository<Product>;

  const mockOrderItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockOrderRepository = {
    findOne: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderItemsService,
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<OrderItemsService>(OrderItemsService);
    orderItemRepository = module.get<Repository<OrderItem>>(getRepositoryToken(OrderItem));
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order item successfully', async () => {
      const createDto = {
        orderId: 1,
        productId: 1,
        quantity: 2,
        price: 100,
      };

      const mockOrder = {
        id: '1',
        client: { id: '1', name: 'John' },
        status: 'pending',
        total: 200,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProduct = {
        id: '1',
        code: 'PROD001',
        name: 'Product 1',
        price: 100,
        stock: 50,
      };

      const expectedOrderItem = {
        id: '1',
        order: mockOrder,
        product: mockProduct,
        quantity: 2,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockOrderItemRepository.create.mockReturnValue(expectedOrderItem);
      mockOrderItemRepository.save.mockResolvedValue(expectedOrderItem);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedOrderItem);
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockOrderItemRepository.save).toHaveBeenCalled();
    });

    it('should use product price if price not provided', async () => {
      const createDto = {
        orderId: 1,
        productId: 1,
        quantity: 2,
      };

      const mockOrder = {
        id: '1',
        status: 'pending',
        total: 200,
      };

      const mockProduct = {
        id: '1',
        code: 'PROD001',
        name: 'Product 1',
        price: 150,
        stock: 50,
      };

      const expectedOrderItem = {
        id: '1',
        order: mockOrder,
        product: mockProduct,
        quantity: 2,
        price: 150,
      };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockOrderItemRepository.create.mockReturnValue(expectedOrderItem);
      mockOrderItemRepository.save.mockResolvedValue(expectedOrderItem);

      const result = await service.create(createDto);

      expect(result.price).toBe(150);
      expect(mockOrderItemRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if order not found', async () => {
      const createDto = {
        orderId: 999,
        productId: 1,
        quantity: 2,
      };

      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow('Order not found');

      expect(mockOrderItemRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if product not found', async () => {
      const createDto = {
        orderId: 1,
        productId: 999,
        quantity: 2,
      };

      const mockOrder = { id: '1', status: 'pending' };
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow('Product not found');

      expect(mockOrderItemRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of order items', async () => {
      const expectedOrderItems = [
        {
          id: '1',
          order: { id: '1', status: 'pending' },
          product: { id: '1', name: 'Product 1' },
          quantity: 2,
          price: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockOrderItemRepository.find.mockResolvedValue(expectedOrderItems);

      const result = await service.findAll();

      expect(result).toEqual(expectedOrderItems);
      expect(mockOrderItemRepository.find).toHaveBeenCalledWith({
        relations: ['order', 'product'],
      });
    });
  });

  describe('findOne', () => {
    it('should return an order item by id', async () => {
      const expectedOrderItem = {
        id: '1',
        order: { id: '1', status: 'pending' },
        product: { id: '1', name: 'Product 1' },
        quantity: 2,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderItemRepository.findOne.mockResolvedValue(expectedOrderItem);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedOrderItem);
      expect(mockOrderItemRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['order', 'product'],
      });
    });

    it('should throw NotFoundException if order item not found', async () => {
      mockOrderItemRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Order item not found');
    });
  });

  describe('update', () => {
    it('should update an order item successfully', async () => {
      const updateDto = {
        quantity: 5,
      };

      const existingOrderItem = {
        id: '1',
        order: { id: '1', status: 'pending' },
        product: { id: '1', name: 'Product 1' },
        quantity: 2,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedOrderItem = {
        ...existingOrderItem,
        quantity: 5,
      };

      mockOrderItemRepository.findOne.mockResolvedValue(existingOrderItem);
      mockOrderItemRepository.save.mockResolvedValue(updatedOrderItem);

      const result = await service.update(1, updateDto);

      expect(result.quantity).toBe(5);
      expect(mockOrderItemRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order item to update not found', async () => {
      const updateDto = { quantity: 5 };

      mockOrderItemRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        'Order item not found',
      );

      expect(mockOrderItemRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an order item successfully', async () => {
      const orderItemToRemove = {
        id: '1',
        order: { id: '1', status: 'pending' },
        product: { id: '1', name: 'Product 1' },
        quantity: 2,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderItemRepository.findOne.mockResolvedValue(orderItemToRemove);
      mockOrderItemRepository.remove.mockResolvedValue(orderItemToRemove);

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Order item removed successfully' });
      expect(mockOrderItemRepository.remove).toHaveBeenCalledWith(orderItemToRemove);
    });

    it('should throw NotFoundException if order item to remove not found', async () => {
      mockOrderItemRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow('Order item not found');

      expect(mockOrderItemRepository.remove).not.toHaveBeenCalled();
    });
  });
});
