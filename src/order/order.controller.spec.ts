import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderStatusDto } from './dto/create-order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrderService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto: any = {
        clientId: 1,
        status: OrderStatusDto.PENDING,
        items: [
          { productId: 1, quantity: 2, price: 100 },
        ],
      };
      const expectedResult = {
        id: '1',
        client: { id: '1', name: 'John' },
        status: 'pending',
        total: 200,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createOrderDto);

      expect(result).toEqual(expectedResult);
      expect(mockOrderService.create).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const expectedResult = [
        {
          id: '1',
          client: { id: '1', name: 'John' },
          status: 'pending',
          total: 200,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockOrderService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockOrderService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const expectedResult = {
        id: '1',
        client: { id: '1', name: 'John' },
        status: 'pending',
        total: 200,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(mockOrderService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const updateOrderDto = {
        status: OrderStatusDto.DELIVERED,
      };
      const expectedResult = {
        id: '1',
        client: { id: '1', name: 'John' },
        status: 'delivered',
        total: 200,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateOrderDto);

      expect(result).toEqual(expectedResult);
      expect(mockOrderService.update).toHaveBeenCalledWith(1, updateOrderDto);
    });
  });

  describe('remove', () => {
    it('should remove an order', async () => {
      const expectedResult = { message: 'Order removed successfully' };

      mockOrderService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(result).toEqual(expectedResult);
      expect(mockOrderService.remove).toHaveBeenCalledWith(1);
    });
  });
});
