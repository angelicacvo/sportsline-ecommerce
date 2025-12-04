# 🧪 Testing Guide - Unit & E2E Tests

## 🎯 Objetivo
Implementar tests unitarios y E2E con Jest para garantizar calidad del código.

---

## 📦 Paso 1: Dependencias (Ya vienen instaladas)

```bash
npm install --save-dev @nestjs/testing jest @types/jest ts-jest
npm install --save-dev supertest @types/supertest
```

---

## 🧪 Paso 2: Unit Tests (Servicios)

### Ejemplo: UserService Test

Crear `src/user/user.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { RoleService } from '../role/role.service';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  let roleService: RoleService;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockRoleService = {
    findByName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    roleService = module.get<RoleService>(RoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: 1, email: 'test@example.com', username: 'test' },
        { id: 2, email: 'test2@example.com', username: 'test2' },
      ];

      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalledWith({ relations: ['role'] });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, email: 'test@example.com', username: 'test' };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['role', 'role.permissions'],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('User not found');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      const role = { id: 1, name: 'customer' };
      const createdUser = { id: 1, ...createUserDto, role };

      mockUserRepository.findOne.mockResolvedValue(null); // No existe
      mockRoleService.findByName.mockResolvedValue(role);
      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(mockRoleService.findByName).toHaveBeenCalledWith('customer');
    });

    it('should throw BadRequestException if email exists', async () => {
      const createUserDto = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue({ id: 1, email: createUserDto.email });

      await expect(service.create(createUserDto)).rejects.toThrow('Email already in use');
    });
  });
});
```

---

## 🧪 Paso 3: Controller Tests

Crear `src/user/user.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [{ id: 1, email: 'test@example.com' }];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const user = { id: 1, email: 'test@example.com' };
      mockUserService.findOne.mockResolvedValue(user);

      const result = await controller.findOne(1);

      expect(result).toEqual(user);
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
    });
  });
});
```

---

## 🔬 Paso 4: E2E Tests

Crear `test/user.e2e-spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/user (GET)', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/user')
        .expect(401);
    });

    it('should return users array with valid token', () => {
      return request(app.getHttpServer())
        .get('/user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/user/:id (GET)', () => {
    it('should return a single user', () => {
      return request(app.getHttpServer())
        .get('/user/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/user/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/user (POST)', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'test123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('testuser@example.com');
        });
    });

    it('should return 400 for duplicate email', () => {
      return request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'duplicate',
          email: 'admin@example.com', // Already exists
          password: 'test123',
        })
        .expect(400);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/user')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'test',
          // Missing email and password
        })
        .expect(400);
    });
  });
});
```

---

## ▶️ Paso 5: Ejecutar Tests

```bash
# Unit tests
npm run test

# Specific file
npm run test user.service.spec

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

---

## 📊 Paso 6: Configurar Jest

`package.json`:

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

---

## 📈 Paso 7: Ver Coverage Report

```bash
npm run test:cov

# Abrir reporte HTML
open coverage/lcov-report/index.html  # Mac
start coverage/lcov-report/index.html # Windows
```

---

## ✅ Checklist Testing

- [ ] Unit tests para services
- [ ] Unit tests para controllers
- [ ] E2E tests para endpoints principales
- [ ] Coverage > 70%
- [ ] Tests pasan exitosamente
- [ ] Mocks configurados correctamente

---

## 💡 Mejores Prácticas

1. **Aislar tests**: Cada test debe ser independiente
2. **AAA Pattern**: Arrange, Act, Assert
3. **Descriptive names**: Nombres claros de lo que testeas
4. **Mock dependencies**: No usar BD real en unit tests
5. **Test edge cases**: Casos límite y errores
6. **Clean up**: Limpiar después de cada test

---

## 🚀 Siguiente Paso

**[Deployment Guide →](./DEPLOYMENT-GUIDE.md)**
