import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { Order, OrderStatus } from './entities/order.entity';
import { Client } from '../client/entities/client.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Product } from '../product/entities/product.entity';
import { Repository } from 'typeorm';
import { OrderStatusDto } from './dto/create-order.dto';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: Repository<Order>;
  let clientRepository: Repository<Client>;
  let orderItemRepository: Repository<OrderItem>;
  let productRepository: Repository<Product>;

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockClientRepository = {
    findOne: jest.fn(),
  };

  const mockOrderItemRepository = {
    create: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Client),
          useValue: mockClientRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    clientRepository = module.get<Repository<Client>>(getRepositoryToken(Client));
    orderItemRepository = module.get<Repository<OrderItem>>(getRepositoryToken(OrderItem));
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order with items successfully', async () => {
      const createDto: any = {
        clientId: 1,
        status: OrderStatusDto.PENDING,
        items: [
          { productId: 1, quantity: 2, price: 100 },
          { productId: 2, quantity: 1, price: 50 },
        ],
      };

      const mockClient = {
        id: '1',
        name: 'John Doe',
        email: 'john@test.com',
        phone: '123456789',
        address: '123 Main St',
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [],
      };

      const mockProduct1 = {
        id: '1',
        code: 'PROD001',
        name: 'Product 1',
        price: 100,
        stock: 50,
      };

      const mockProduct2 = {
        id: '2',
        code: 'PROD002',
        name: 'Product 2',
        price: 50,
        stock: 30,
      };

      const mockOrderItem1 = {
        id: '1',
        product: mockProduct1,
        quantity: 2,
        price: 100,
      };

      const mockOrderItem2 = {
        id: '2',
        product: mockProduct2,
        quantity: 1,
        price: 50,
      };

      const expectedOrder = {
        id: '1',
        client: mockClient,
        status: OrderStatus.PENDING,
        total: 250,
        items: [mockOrderItem1, mockOrderItem2],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockClientRepository.findOne.mockResolvedValue(mockClient);
      mockProductRepository.findOne.mockResolvedValueOnce(mockProduct1);
      mockProductRepository.findOne.mockResolvedValueOnce(mockProduct2);
      mockOrderItemRepository.create.mockReturnValueOnce(mockOrderItem1);
      mockOrderItemRepository.create.mockReturnValueOnce(mockOrderItem2);
      mockOrderRepository.create.mockReturnValue(expectedOrder);
      mockOrderRepository.save.mockResolvedValue(expectedOrder);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedOrder);
      expect(mockClientRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockProductRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if client not found', async () => {
      const createDto: any = {
        clientId: 999,
        items: [{ productId: 1, quantity: 2 }],
      };

      mockClientRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow('Client not found');

      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if no items provided', async () => {
      const createDto: any = {
        clientId: 1,
        items: [],
      };

      const mockClient = { id: '1', name: 'John' };
      mockClientRepository.findOne.mockResolvedValue(mockClient);

      await expect(service.create(createDto)).rejects.toThrow(
        'At least one item is required',
      );

      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if product not found', async () => {
      const createDto: any = {
        clientId: 1,
        items: [{ productId: 999, quantity: 2 }],
      };

      const mockClient = { id: '1', name: 'John' };
      mockClientRepository.findOne.mockResolvedValue(mockClient);
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        'Product 999 not found',
      );

      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const expectedOrders = [
        {
          id: '1',
          client: { id: '1', name: 'John' },
          status: OrderStatus.PENDING,
          total: 250,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockOrderRepository.find.mockResolvedValue(expectedOrders);

      const result = await service.findAll();

      expect(result).toEqual(expectedOrders);
      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        relations: ['client', 'items', 'items.product'],
      });
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const expectedOrder = {
        id: '1',
        client: { id: '1', name: 'John' },
        status: OrderStatus.PENDING,
        total: 250,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepository.findOne.mockResolvedValue(expectedOrder);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedOrder);
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['client', 'items', 'items.product'],
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Order not found');
    });
  });

  describe('update', () => {
    it('should update order status successfully', async () => {
      const updateDto = {
        status: OrderStatusDto.DELIVERED,
      };

      const existingOrder = {
        id: '1',
        client: { id: '1', name: 'John' },
        status: OrderStatus.PENDING,
        total: 250,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedOrder = {
        ...existingOrder,
        status: OrderStatus.DELIVERED,
      };

      mockOrderRepository.findOne.mockResolvedValue(existingOrder);
      mockOrderRepository.save.mockResolvedValue(updatedOrder);

      const result = await service.update(1, updateDto);

      expect(result.status).toBe(OrderStatus.DELIVERED);
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order to update not found', async () => {
      const updateDto = { status: OrderStatusDto.DELIVERED };

      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        'Order not found',
      );

      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an order successfully', async () => {
      const orderToRemove = {
        id: '1',
        client: { id: '1', name: 'John' },
        status: OrderStatus.PENDING,
        total: 250,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepository.findOne.mockResolvedValue(orderToRemove);
      mockOrderRepository.remove.mockResolvedValue(orderToRemove);

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Order removed successfully' });
      expect(mockOrderRepository.remove).toHaveBeenCalledWith(orderToRemove);
    });

    it('should throw NotFoundException if order to remove not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow('Order not found');

      expect(mockOrderRepository.remove).not.toHaveBeenCalled();
    });
  });
});
