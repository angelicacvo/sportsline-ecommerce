# 🚀 Implementación de Prácticas - Riwi SportsLine E-commerce

## 📋 Tabla de Contenidos
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Semana 1: Fundamentos de NestJS](#semana-1-fundamentos-de-nestjs)
- [Semana 2: TypeORM y Persistencia](#semana-2-typeorm-y-persistencia)
- [Semana 3: Arquitectura Modular y DTOs](#semana-3-arquitectura-modular-y-dtos)
- [Middleware, Filtros e Interceptores](#middleware-filtros-e-interceptores)
- [Autenticación JWT con Roles y Permisos](#autenticación-jwt-con-roles-y-permisos)
- [Autenticaciones Avanzadas](#autenticaciones-avanzadas)
- [Pruebas y Análisis Estático](#pruebas-y-análisis-estático)

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Microservicios
```
sportsline-ecommerce/
├── src/
│   ├── gateway/                    # API Gateway (HTTP)
│   │   ├── controllers/           # Controladores REST
│   │   │   ├── users/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── orders/
│   │   │   └── order-items/
│   │   ├── auth/                  # Módulo de autenticación
│   │   │   ├── dto/
│   │   │   ├── strategies/        # JWT & Refresh Token
│   │   │   ├── interfaces/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── guards/                # Guards de autenticación
│   │   ├── decorators/            # Decoradores personalizados
│   │   ├── filters/               # Exception filters
│   │   ├── interceptors/          # Interceptores
│   │   ├── middleware/            # Middleware personalizado
│   │   └── gateway.module.ts
│   ├── users/                     # Microservicio Users (TCP:4001)
│   ├── products/                  # Microservicio Products (TCP:4002)
│   ├── orders/                    # Microservicio Orders (TCP:4003)
│   ├── orderItems/                # Microservicio OrderItems (TCP:4004)
│   ├── categories/                # Microservicio Categories (TCP:4005)
│   └── libs/
│       ├── database/              # Módulo compartido de BD
│       └── seeder/                # Seeders iniciales
├── test/
│   └── unit/                      # Tests unitarios organizados
│       ├── users/
│       ├── products/
│       ├── orders/
│       ├── categories/
│       └── orderItems/
└── docker-compose.yml             # Orquestación de servicios
```

---

## ✅ Semana 1: Fundamentos de NestJS

### Estado: ✅ COMPLETADO

#### 1. Setup del Proyecto
**Ubicación:** `package.json`, `nest-cli.json`, `tsconfig.json`

```json
// package.json
{
  "name": "sportsline-ecommerce",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build && nest build users && ...",
    "start:dev": "nest start --watch",
    "start:docker": "docker-compose up -d"
  }
}
```

#### 2. Configuración de Variables de Entorno
**Ubicación:** `.env`, `src/gateway/main.ts`

```typescript
// Variables configuradas:
- DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
- JWT_SECRET, JWT_REFRESH_SECRET
- JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN
- Puertos de microservicios (4001-4005)
```

#### 3. Integración TypeScript, ESLint, Prettier
**Archivos:**
- `tsconfig.json` - Configuración TypeScript estricta
- `eslint.config.mjs` - Reglas de linting
- `.prettierrc` - Formato de código

#### 4. Conexión PostgreSQL con TypeORM
**Ubicación:** `src/libs/database/database.module.ts`

```typescript
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        // ... configuración completa
      }),
    }),
  ],
})
export class DatabaseModule {}
```

**✅ Validación:** Servidor arranca en puerto 3000 (Gateway) y microservicios en 4001-4005

---

## ✅ Semana 2: TypeORM y Persistencia

### Estado: ✅ COMPLETADO

#### 1. Entidades con TypeORM
**Ubicación:** `src/*/entities/*.entity.ts`

**User Entity:**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;
}
```

**Product Entity:**
```typescript
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}
```

**Order Entity:**
```typescript
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  orderItems: OrderItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;
}
```

#### 2. Relaciones Implementadas
- `User` 1:N `Order` (OneToMany)
- `Order` 1:N `OrderItem` (OneToMany)
- `Product` N:1 `Category` (ManyToOne)
- `OrderItem` N:1 `Product` (ManyToOne)
- `OrderItem` N:1 `Order` (ManyToOne)

#### 3. Seeders
**Ubicación:** `src/libs/seeder/seed.ts`

```typescript
// Orden de población:
1. Categories (5 categorías deportivas)
2. Products (10 productos con categorías)
3. Users (3 usuarios: admin + 2 users)
4. Orders (2 órdenes)
5. OrderItems (3 items por orden)
```

**Ejecutar seeders:**
```bash
npm run seed
```

#### 4. Repositorios y CRUD
**Ubicación:** `src/*/services/*.service.ts`

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) 
    private userRepository: Repository<User>
  ) {}

  create(dto: CreateUserDto) {
    return this.userRepository.save(dto);
  }

  findAll() {
    return this.userRepository.find();
  }
  
  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}
```

---

## ✅ Semana 3: Arquitectura Modular y DTOs

### Estado: ✅ COMPLETADO

#### 1. Módulos Generados
**Estructura de cada microservicio:**
```
src/users/
├── dto/
│   ├── createUser.dto.ts
│   └── updateUser.dto.ts
├── entities/
│   └── user.entity.ts
├── users.controller.ts
├── users.message.controller.ts  # TCP MessagePattern
├── users.service.ts
├── users.module.ts
└── main.ts
```

#### 2. DTOs con Validación
**Ubicación:** `src/gateway/auth/dto/*.dto.ts`

**LoginDto:**
```typescript
export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
```

**RegisterDto:**
```typescript
export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ default: 'user', required: false })
  @IsString()
  @IsOptional()
  role?: string;
}
```

#### 3. ConfigModule y Variables de Entorno
**Validación automática en main.ts:**
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

#### 4. Inyección de Dependencias
**Comunicación Gateway → Microservicios:**
```typescript
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject('USERS_SERVICE') private usersClient: ClientProxy,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await firstValueFrom(
      this.usersClient.send({ cmd: 'find_user_by_email' }, loginDto.email)
    );
    // ...
  }
}
```

#### 5. Pruebas Unitarias
**Ubicación:** `test/unit/*/`

**Configuración:** `jest.config.js`
```javascript
module.exports = {
  rootDir: '.',
  testRegex: 'test/unit/.*\\.spec\\.ts$',
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/main.ts',
    '!src/**/seeder/**'
  ]
};
```

**Ejemplo de test:**
```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

**Ejecutar tests:**
```bash
npm test              # Todos los tests
npm run test:cov      # Con cobertura
```

---

## ✅ Middleware, Filtros e Interceptores

### Estado: ✅ COMPLETADO

#### 1. Middleware de Logging
**Ubicación:** `src/gateway/middleware/logger.middleware.ts`

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      const contentLength = res.get('content-length') || 0;
      
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${responseTime}ms - ${contentLength} bytes`
      );
    });

    next();
  }
}
```

**Aplicado en:** `src/gateway/main.ts`
```typescript
app.use((req, res, next) => {
  const middleware = new LoggerMiddleware();
  middleware.use(req, res, next);
});
```

#### 2. Exception Filters
**Ubicación:** `src/gateway/filters/`

**HttpExceptionFilter:**
```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message,
      error: exception.name,
    });
  }
}
```

**RpcExceptionFilter:**
```typescript
@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const error: any = exception.getError();
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

**Aplicación global:** `src/gateway/gateway.module.ts`
```typescript
providers: [
  {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter,
  },
  {
    provide: APP_FILTER,
    useClass: RpcExceptionFilter,
  },
]
```

#### 3. Guards Personalizados
**Ubicación:** `src/gateway/guards/`

**JwtAuthGuard:**
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

**RolesGuard:**
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user?.role === role);
  }
}
```

**Aplicación global:**
```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,  // Protege todas las rutas por defecto
  },
  {
    provide: APP_GUARD,
    useClass: RolesGuard,    // Valida roles cuando @Roles() está presente
  },
]
```

#### 4. Interceptores
**Ubicación:** `src/gateway/interceptors/`

**TransformInterceptor:**
```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

**LoggingInterceptor:**
```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(`${method} ${url} - ${responseTime}ms`);
      }),
    );
  }
}
```

**Aplicación global:**
```typescript
providers: [
  {
    provide: APP_INTERCEPTOR,
    useClass: TransformInterceptor,  // Todas las respuestas
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,    // Logging de tiempo
  },
]
```

---

## ✅ Autenticación JWT con Roles y Permisos

### Estado: ✅ COMPLETADO

#### 1. Módulo de Autenticación
**Ubicación:** `src/gateway/auth/`

**AuthModule:**
```typescript
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    ClientsModule.register([microservicesConfig.USERS_SERVICE]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
```

#### 2. Estrategias JWT
**JwtStrategy:**
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

**RefreshTokenStrategy:**
```typescript
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

#### 3. AuthService con JWT y Refresh Token
**Ubicación:** `src/gateway/auth/auth.service.ts`

```typescript
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject('USERS_SERVICE') private usersClient: ClientProxy,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Create user via microservice
    const user = await firstValueFrom(
      this.usersClient.send({ cmd: 'create_user' }, {
        ...registerDto,
        password: hashedPassword,
      }),
    );

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await firstValueFrom(
      this.usersClient.send({ cmd: 'find_user_by_email' }, loginDto.email)
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshToken(userId: number): Promise<AuthResponse> {
    const user = await firstValueFrom(
      this.usersClient.send({ cmd: 'find_user_by_id' }, userId)
    );

    return this.generateTokens(user);
  }

  private generateTokens(user: any): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role || 'user',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: { ...user, password: undefined },
    };
  }
}
```

#### 4. Controlador de Autenticación
**Endpoints implementados:**

```typescript
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@CurrentUser('userId') userId: number) {
    return this.authService.refreshToken(userId);
  }

  @Get('profile')
  @ApiBearerAuth()
  async getProfile(@CurrentUser('userId') userId: number) {
    return this.authService.getProfile(userId);
  }
}
```

#### 5. Decoradores Personalizados
**Ubicación:** `src/gateway/decorators/`

**@Public():**
```typescript
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**@Roles():**
```typescript
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

**@CurrentUser():**
```typescript
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

#### 6. Protección de Rutas
**Ejemplos de uso:**

```typescript
// Ruta pública
@Public()
@Get('products')
findAll() { }

// Ruta protegida (requiere autenticación)
@Get('profile')
@ApiBearerAuth()
getProfile(@CurrentUser() user) { }

// Ruta solo para admin
@Roles('admin')
@ApiBearerAuth()
@Delete('users/:id')
remove(@Param('id') id: string) { }

// Ruta para usuarios autenticados
@Post('orders')
@ApiBearerAuth()
create(@Body() dto: CreateOrderDto, @CurrentUser('userId') userId: number) { }
```

#### 7. Roles desde Base de Datos
**User Entity con rol:**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;  // 'user' | 'admin'
}
```

**Roles en seeders:**
```typescript
await userRepository.save([
  {
    name: 'Admin User',
    email: 'admin@sportsline.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'admin',
  },
  {
    name: 'Regular User',
    email: 'user@sportsline.com',
    password: await bcrypt.hash('user123', 10),
    role: 'user',
  },
]);
```

#### 8. Flujo de Autenticación
```
1. POST /auth/register
   └─> Hash password → Create user → Generate tokens

2. POST /auth/login
   └─> Validate credentials → Compare password → Generate tokens

3. POST /auth/refresh
   └─> Validate refresh token → Generate new access token

4. GET /auth/profile
   └─> Validate JWT → Return user data

5. Protected Route
   └─> JwtAuthGuard → RolesGuard → Controller
```

**Respuesta de login/register:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user"
    }
  },
  "timestamp": "2025-11-27T..."
}
```

---

## ⏳ Autenticaciones Avanzadas

### Estado: 🔄 PENDIENTE

#### 1. X-API-Key Authentication
**Pendiente de implementar:**
- [ ] Estrategia de API Key
- [ ] Validación contra base de datos
- [ ] Decorador @ApiKey()
- [ ] Guard para validar API keys

**Diseño propuesto:**
```typescript
// api-key.strategy.ts
@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  async validate(apiKey: string) {
    // Validar contra BD
  }
}

// Uso
@UseGuards(ApiKeyGuard)
@Get('external/products')
getProducts(@Headers('x-api-key') apiKey: string) { }
```

#### 2. OAuth2 (Google, GitHub)
**Pendiente de implementar:**
- [ ] Instalación de `@nestjs/passport-google-oauth20`
- [ ] Estrategia OAuth2
- [ ] Endpoints de callback
- [ ] Integración con JWT existente

**Diseño propuesto:**
```typescript
@Get('auth/google')
@UseGuards(AuthGuard('google'))
async googleAuth() { }

@Get('auth/google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthCallback(@Req() req) {
  return this.authService.validateOAuthUser(req.user);
}
```

---

## ✅ Pruebas y Análisis Estático

### Estado: 🔄 EN PROGRESO

#### 1. Swagger Documentation
**Estado:** ✅ COMPLETADO

**Ubicación:** `src/gateway/main.ts`

```typescript
const config = new DocumentBuilder()
  .setTitle('Sportsline API Gateway')
  .setDescription('HTTP facade for microservices')
  .setVersion('1.0')
  .addBearerAuth()  // JWT authentication
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

**Acceso:** http://localhost:3000/docs

**DTOs documentados con decoradores:**
```typescript
export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
```

**Respuestas documentadas:**
```typescript
@ApiOperation({ summary: 'Login user' })
@ApiResponse({ status: 200, description: 'User successfully logged in' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@Post('login')
async login(@Body() loginDto: LoginDto) { }
```

#### 2. Tests Unitarios
**Estado:** ✅ COMPLETADO

**Cobertura actual:** ~21.55%

**Estructura de tests:**
```
test/unit/
├── users/
│   └── users.service.spec.ts
├── products/
│   └── products.service.spec.ts
├── orders/
│   └── orders.service.spec.ts
├── categories/
│   └── categories.service.spec.ts
└── orderItems/
    └── orderItems.service.spec.ts
```

**Comandos:**
```bash
npm test                 # Ejecutar todos los tests
npm run test:watch       # Watch mode
npm run test:cov         # Con cobertura
npm run test:debug       # Debug mode
```

**Ejemplo de test con mocks:**
```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should create a user', async () => {
    const dto = { username: 'test', email: 'test@test.com' };
    jest.spyOn(repository, 'create').mockReturnValue(dto as any);
    jest.spyOn(repository, 'save').mockResolvedValue(dto as any);

    const result = await service.create(dto);
    expect(result).toEqual(dto);
  });
});
```

#### 3. SonarQube
**Estado:** ⏳ PENDIENTE

**Pendiente de configurar:**
- [ ] Instalación de SonarQube local o integración con SonarCloud
- [ ] Archivo `sonar-project.properties`
- [ ] Configuración de análisis de código
- [ ] Integración con CI/CD

**Configuración propuesta:**
```properties
sonar.projectKey=sportsline-ecommerce
sonar.projectName=Sportsline E-commerce
sonar.sources=src
sonar.tests=test
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.exclusions=**/node_modules/**,**/dist/**,**/*.spec.ts
```

#### 4. Pre-commit Hooks (Husky)
**Estado:** ⏳ PENDIENTE

**Pendiente de configurar:**
- [ ] Instalación de Husky y lint-staged
- [ ] Configuración de hooks
- [ ] Validación de linting antes de commit
- [ ] Ejecución de tests antes de push

**Configuración propuesta:**
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## 🚀 Cómo Ejecutar el Proyecto

### Requisitos Previos
- Node.js 18+
- PostgreSQL 16
- Docker & Docker Compose (opcional)

### Instalación
```bash
# Clonar repositorio
git clone <repo-url>
cd sportsline-ecommerce

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### Ejecución Local
```bash
# Iniciar base de datos
docker-compose up -d postgres

# Ejecutar seeders
npm run seed

# Iniciar gateway
npm run start:dev:gateway

# En terminales separadas, iniciar microservicios
npm run start:dev:users
npm run start:dev:products
npm run start:dev:orders
npm run start:dev:order-items
npm run start:dev:categories
```

### Ejecución con Docker
```bash
# Iniciar todos los servicios
npm run start:docker

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Acceso
- **API Gateway:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/docs
- **PostgreSQL:** localhost:5432

### Pruebas
```bash
# Tests unitarios
npm test

# Tests con cobertura
npm run test:cov

# Tests E2E
npm run test:e2e
```

---

## 📊 Métricas de Implementación

### ✅ Completado (70%)
- Fundamentos NestJS
- TypeORM y persistencia
- Arquitectura modular
- DTOs y validación
- Middleware y filtros
- Guards e interceptores
- Autenticación JWT
- Refresh Token
- Roles desde BD
- Swagger básico
- Tests unitarios básicos

### 🔄 En Progreso (20%)
- Mejora de cobertura de tests
- Documentación Swagger avanzada
- Tests E2E

### ⏳ Pendiente (10%)
- X-API-Key authentication
- OAuth2 integration
- SonarQube setup
- Pre-commit hooks (Husky)
- Tests de caja negra completos

---

## 📚 Referencias y Documentación

### Documentación Oficial
- [NestJS Docs](https://docs.nestjs.com/)
- [TypeORM Docs](https://typeorm.io/)
- [Passport.js](http://www.passportjs.org/)
- [JWT.io](https://jwt.io/)

### Arquitectura
- Microservicios con TCP Transport
- API Gateway Pattern
- Repository Pattern
- Dependency Injection

### Seguridad
- JWT con Access & Refresh Tokens
- Password hashing con bcryptjs
- Role-Based Access Control (RBAC)
- Guards globales

---

## 👥 Equipo y Contribución

**Proyecto:** Riwi SportsLine E-commerce  
**Framework:** NestJS 11  
**Arquitectura:** Microservicios  
**Base de datos:** PostgreSQL 16  

**Última actualización:** Noviembre 27, 2025
