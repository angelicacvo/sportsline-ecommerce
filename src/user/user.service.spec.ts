import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserRoleDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

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
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createDto = {
        username: 'johndoe',
        email: 'john@test.com',
        password: 'password123',
        role: UserRoleDto.CUSTOMER,
      };

      const expectedUser = {
        id: '1',
        username: 'johndoe',
        email: 'john@test.com',
        password: 'password123',
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(expectedUser);
      mockRepository.save.mockResolvedValue(expectedUser);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email already exists', async () => {
      const createDto = {
        username: 'johndoe',
        email: 'john@test.com',
        password: 'password123',
        role: UserRoleDto.CUSTOMER,
      };

      const existingUser = {
        id: '1',
        username: 'existinguser',
        email: 'john@test.com',
        password: 'pass',
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      };

      mockRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createDto)).rejects.toThrow(
        'Email already in use',
      );

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        {
          id: '1',
          username: 'johndoe',
          email: 'john@test.com',
          password: 'password123',
          role: UserRole.CUSTOMER,
          createdAt: new Date(),
          updatedAt: new Date(),
          products: [],
        },
        {
          id: '2',
          username: 'janedoe',
          email: 'jane@test.com',
          password: 'password456',
          role: UserRole.SELLER,
          createdAt: new Date(),
          updatedAt: new Date(),
          products: [],
        },
      ];

      mockRepository.find.mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(result).toEqual(expectedUsers);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should return empty array if no users exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const expectedUser = {
        id: '1',
        username: 'johndoe',
        email: 'john@test.com',
        password: 'password123',
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      };

      mockRepository.findOne.mockResolvedValue(expectedUser);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('User not found');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
      });
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateDto = {
        username: 'johnupdated',
      };

      const existingUser = {
        id: '1',
        username: 'johndoe',
        email: 'john@test.com',
        password: 'password123',
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      };

      const updatedUser = {
        ...existingUser,
        ...updateDto,
      };

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user to update not found', async () => {
      const updateDto = { username: 'johnupdated' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        'User not found',
      );

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if updating to existing email', async () => {
      const updateDto = {
        email: 'existing@test.com',
      };

      const userToUpdate = {
        id: '1',
        username: 'johndoe',
        email: 'john@test.com',
        password: 'password123',
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      };

      const userWithSameEmail = {
        id: '2',
        username: 'janedoe',
        email: 'existing@test.com',
        password: 'password456',
        role: UserRole.SELLER,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      };

      mockRepository.findOne.mockResolvedValueOnce(userToUpdate);
      mockRepository.findOne.mockResolvedValueOnce(userWithSameEmail);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        'Email already in use',
      );

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const userToRemove = {
        id: '1',
        username: 'johndoe',
        email: 'john@test.com',
        password: 'password123',
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      };

      mockRepository.findOne.mockResolvedValue(userToRemove);
      mockRepository.remove.mockResolvedValue(userToRemove);

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'User removed successfully' });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(userToRemove);
    });

    it('should throw NotFoundException if user to remove not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow('User not found');

      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});
