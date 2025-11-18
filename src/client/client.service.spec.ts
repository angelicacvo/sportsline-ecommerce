import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientService } from './client.service';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';

describe('ClientService', () => {
  let service: ClientService;
  let repository: Repository<Client>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    repository = module.get<Repository<Client>>(getRepositoryToken(Client));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a client successfully', async () => {
      const createDto = {
        name: 'John Doe',
        email: 'john@test.com',
        phone: '1234567890',
        address: '123 Main St',
      };

      const expectedClient = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [],
      };

      // Simular que el email NO existe
      mockRepository.findOne.mockResolvedValue(null);
      // Simular que create devuelve el objeto
      mockRepository.create.mockReturnValue(expectedClient);
      // Simular que save guarda en DB
      mockRepository.save.mockResolvedValue(expectedClient);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedClient);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedClient);
    });

    it('should throw BadRequestException if email already exists', async () => {
      const createDto = {
        name: 'John Doe',
        email: 'john@test.com',
        phone: '1234567890',
        address: '123 Main St',
      };

      const existingClient = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [],
      };

      // Simular que el email YA existe
      mockRepository.findOne.mockResolvedValue(existingClient);

      await expect(service.create(createDto)).rejects.toThrow(
        'Client with this email already exists',
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      // Verificar que NO se llamó a save porque falló antes
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of clients', async () => {
      const expectedClients = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@test.com',
          phone: '1234567890',
          address: '123 Main St',
          createdAt: new Date(),
          updatedAt: new Date(),
          orders: [],
        },
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@test.com',
          phone: '0987654321',
          address: '456 Oak St',
          createdAt: new Date(),
          updatedAt: new Date(),
          orders: [],
        },
      ];

      mockRepository.find.mockResolvedValue(expectedClients);

      const result = await service.findAll();

      expect(result).toEqual(expectedClients);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should return empty array if no clients exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      const expectedClient = {
        id: '1',
        name: 'John Doe',
        email: 'john@test.com',
        phone: '1234567890',
        address: '123 Main St',
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [],
      };

      mockRepository.findOne.mockResolvedValue(expectedClient);

      const result = await service.findOne('1');

      expect(result).toEqual(expectedClient);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow('Client not found');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
      });
    });
  });

  describe('update', () => {
    it('should update a client successfully', async () => {
      const updateDto = {
        name: 'John Updated',
        phone: '9999999999',
      };

      const existingClient = {
        id: '1',
        name: 'John Doe',
        email: 'john@test.com',
        phone: '1234567890',
        address: '123 Main St',
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [],
      };

      const updatedClient = {
        ...existingClient,
        ...updateDto,
      };

      // Primera llamada: buscar cliente por ID
      mockRepository.findOne.mockResolvedValueOnce(existingClient);
      // Segunda llamada: buscar si el email ya existe (si se actualiza email)
      mockRepository.findOne.mockResolvedValueOnce(null);
      // Simular save
      mockRepository.save.mockResolvedValue(updatedClient);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedClient);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if client to update not found', async () => {
      const updateDto = { name: 'John Updated' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        'Client not found',
      );

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if updating to existing email', async () => {
      const updateDto = {
        email: 'existing@test.com',
      };

      const clientToUpdate = {
        id: '1',
        name: 'John Doe',
        email: 'john@test.com',
        phone: '1234567890',
        address: '123 Main St',
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [],
      };

      const clientWithSameEmail = {
        id: '2',
        name: 'Jane Doe',
        email: 'existing@test.com',
        phone: '0987654321',
        address: '456 Oak St',
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [],
      };

      // Primera llamada: encuentra el cliente a actualizar
      mockRepository.findOne.mockResolvedValueOnce(clientToUpdate);
      // Segunda llamada: encuentra que el email ya existe en otro cliente
      mockRepository.findOne.mockResolvedValueOnce(clientWithSameEmail);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        'Client with this email already exists',
      );

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a client successfully', async () => {
      const clientToRemove = {
        id: '1',
        name: 'John Doe',
        email: 'john@test.com',
        phone: '1234567890',
        address: '123 Main St',
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [],
      };

      mockRepository.findOne.mockResolvedValue(clientToRemove);
      mockRepository.remove.mockResolvedValue(clientToRemove);

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Client removed successfully' });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(clientToRemove);
    });

    it('should throw NotFoundException if client to remove not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow('Client not found');

      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});
