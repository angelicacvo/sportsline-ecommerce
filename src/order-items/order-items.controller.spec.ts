import { Test, TestingModule } from '@nestjs/testing';
import { OrderItemsController } from './order-items.controller';
import { OrderItemsService } from './order-items.service';

describe('OrderItemsController', () => {
  let controller: OrderItemsController;
  let service: OrderItemsService;

  const mockOrderItemsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderItemsController],
      providers: [
        {
          provide: OrderItemsService,
          useValue: mockOrderItemsService,
        },
      ],
    }).compile();

    controller = module.get<OrderItemsController>(OrderItemsController);
    service = module.get<OrderItemsService>(OrderItemsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order item', async () => {
      const createOrderItemDto = {
        orderId: 1,
        productId: 1,
        quantity: 2,
        price: 100,
      };
      const expectedResult = {
        id: '1',
        order: { id: '1', status: 'pending' },
        product: { id: '1', name: 'Product 1' },
        quantity: 2,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderItemsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createOrderItemDto);

      expect(result).toEqual(expectedResult);
      expect(mockOrderItemsService.create).toHaveBeenCalledWith(createOrderItemDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of order items', async () => {
      const expectedResult = [
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

      mockOrderItemsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockOrderItemsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single order item', async () => {
      const expectedResult = {
        id: '1',
        order: { id: '1', status: 'pending' },
        product: { id: '1', name: 'Product 1' },
        quantity: 2,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderItemsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(mockOrderItemsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an order item', async () => {
      const updateOrderItemDto = {
        quantity: 5,
      };
      const expectedResult = {
        id: '1',
        order: { id: '1', status: 'pending' },
        product: { id: '1', name: 'Product 1' },
        quantity: 5,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderItemsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateOrderItemDto);

      expect(result).toEqual(expectedResult);
      expect(mockOrderItemsService.update).toHaveBeenCalledWith(1, updateOrderItemDto);
    });
  });

  describe('remove', () => {
    it('should remove an order item', async () => {
      const expectedResult = { message: 'Order item removed successfully' };

      mockOrderItemsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(result).toEqual(expectedResult);
      expect(mockOrderItemsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
