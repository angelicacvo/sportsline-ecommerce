import { Test, TestingModule } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';

describe('ClientController', () => {
  let controller: ClientController;
  let service: ClientService;

  const mockClientService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        {
          provide: ClientService,
          useValue: mockClientService,
        },
      ],
    }).compile();

    controller = module.get<ClientController>(ClientController);
    service = module.get<ClientService>(ClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const createClientDto = {
        name: 'Angelica',
        email: 'angelica@g.com',
        phone: '1234567890',
        address: 'Carrera 123',
      };
      const expectedResult = {
        id: '1',
        ...createClientDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [],
      };

      mockClientService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createClientDto);

      expect(result).toEqual(expectedResult);
      expect(mockClientService.create).toHaveBeenCalledWith(createClientDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of clients', async () => {
      const expectedResult = [
        {
          id: '1',
          name: 'Angelica',
          email: 'angelica@g.com',
          phone: '1234567890',
          address: 'Carrera 123',
          createdAt: new Date(),
          updatedAt: new Date(),
          orders: [],
        },
      ];

      mockClientService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockClientService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single client', async () => {
      const expectedResult = {
        id: '1',
        name: 'Angelica',
        email: 'angelica@g.com',
        phone: '1234567890',
        address: 'Carrera 123',
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [],
      };

      mockClientService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(mockClientService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const updateClientDto = {
        name: 'Angelica Updated',
        email: 'angelica.updated@g.com',
      };
      const expectedResult = {
        id: '1',
        name: 'Angelica Updated',
        email: 'angelica.updated@g.com',
        phone: '1234567890',
        address: 'Carrera 123',
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [],
      };

      mockClientService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateClientDto);

      expect(result).toEqual(expectedResult);
      expect(mockClientService.update).toHaveBeenCalledWith(1, updateClientDto);
    });
  });

  describe('remove', () => {
    it('should remove a client', async () => {
      const expectedResult = { message: 'Client removed successfully' };

      mockClientService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(result).toEqual(expectedResult);
      expect(mockClientService.remove).toHaveBeenCalledWith(1);
    });
  });
});