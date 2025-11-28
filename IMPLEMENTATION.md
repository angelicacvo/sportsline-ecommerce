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

### Estado Actual: ✅ COMPLETADO

#### 1. Setup del Proyecto

**Ubicación:** `package.json`, `nest-cli.json`, `tsconfig.json`

- Configuración de scripts build, start, docker
- Estructura de monorepo con 6 aplicaciones

#### 2. Configuración de Variables de Entorno

**Ubicación:** `.env`, `src/gateway/main.ts`

- Variables: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
- JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN
- Puertos microservicios: 4001-4005

#### 3. Integración TypeScript, ESLint, Prettier

- `tsconfig.json`: TypeScript estricto
- `eslint.config.mjs`: Reglas de linting
- `.prettierrc`: Formato de código

#### 4. Conexión PostgreSQL con TypeORM

**Ubicación:** `src/libs/database/database.module.ts`

- Módulo compartido con TypeOrmModule.forRootAsync
- Configuración desde variables de entorno
- **✅ Validación:** Gateway en puerto 3000, microservicios 4001-4005

---

## ✅ Semana 2: TypeORM y Persistencia

### Estado: ✅ COMPLETADO

#### 1. Entidades con TypeORM

**Ubicación:** `src/*/entities/*.entity.ts`

- **User:** id (UUID), name, email (unique), password, role
- **Product:** id, title (unique), description, stock, value, categoryId (FK), timestamps
- **Order:** id, userId (FK), total, timestamps
- **OrderItem:** id, orderId (FK), productId (FK), quantity, price
- **Category:** id, name, description

#### 2. Relaciones Implementadas

- `User` 1:N `Order` (OneToMany)
- `Order` 1:N `OrderItem` (OneToMany)
- `Product` N:1 `Category` (ManyToOne)
- `OrderItem` N:1 `Product` (ManyToOne)
- `OrderItem` N:1 `Order` (ManyToOne)

#### 3. Seeders

**Ubicación:** `seed.sql`

- Categories: 3 categorías deportivas
- Products: 3 productos con FK a categorías
- Users: 2 usuarios (<admin@sportsline.com>/admin123, <user@sportsline.com>/user123) con bcrypt
- **Ejecutar:** `npm run seed` (ejecuta `seed.sql` en Postgres via Docker)

#### 4. Repositorios y CRUD

**Ubicación:** `src/*/services/*.service.ts`

- Inyección de `Repository<Entity>` con `@InjectRepository`
- Métodos: create, findAll, findOne, findById, findByEmail, update, remove
- Uso de TypeORM query builder y métodos del repositorio

---

## ✅ Semana 3: Arquitectura Modular y DTOs

### Estado: ✅ COMPLETADO

#### 1. Módulos Generados

**Estructura de cada microservicio:**

- `dto/`: CreateDto, UpdateDto con validaciones
- `entities/`: Entidad TypeORM
- `controller.ts`: Endpoints HTTP (solo gateway)
- `message.controller.ts`: MessagePattern TCP para RPC
- `service.ts`: Lógica de negocio y acceso a BD
- `module.ts`: Importa TypeORM, providers, exports
- `main.ts`: Bootstrap del microservicio TCP

#### 2. DTOs con Validación

**Ubicación:** `src/gateway/auth/dto/*.dto.ts`, `src/*/dto/*.dto.ts`

- Decoradores: `@IsEmail`, `@IsString`, `@IsNotEmpty`, `@MinLength`, `@IsOptional`, `@IsInt`, `@Min`
- Swagger: `@ApiProperty`, `@ApiPropertyOptional` con ejemplos
- LoginDto: email, password (min 6 chars)
- RegisterDto: name, email, password, role (optional)
- CreateProductDto: title, description, stock, value, categoryId
- UpdateDto usando `@nestjs/mapped-types` PartialType

#### 3. ConfigModule y Variables de Entorno

**Validación automática:**

- ValidationPipe global con whitelist, forbidNonWhitelisted, transform
- Variables desde `.env`: JWT_SECRET, DB_*, puertos microservicios
- Acceso via `process.env.VARIABLE_NAME`

#### 4. Inyección de Dependencias

**Comunicación Gateway → Microservicios:**

- `@Inject('SERVICE_NAME')` con `ClientProxy` de NestJS Microservices
- `firstValueFrom()` para convertir Observables a Promises
- Patrón RPC: `client.send({ cmd: 'command_name' }, payload)`
- ClientsModule.register con configuración TCP (host, port)

#### 5. Pruebas Unitarias

**Ubicación:** `test/unit/*/`

- Configuración: `jest.config.js` con rootDir, testRegex, cobertura
- Tests organizados por servicio: users, products, orders, categories, orderItems
- Mock de repositorios con `getRepositoryToken(Entity)`
- `Test.createTestingModule` para crear contexto de prueba
- **Ejecutar:** `npm test`, `npm run test:cov` (cobertura actual ~21%)

---

## ✅ Middleware, Filtros e Interceptores

### Estado: ✅ COMPLETADO

#### 1. Middleware de Logging

**Ubicación:** `src/gateway/middleware/logger.middleware.ts`

- Implementa `NestMiddleware`
- Logger para método, URL, statusCode, tiempo de respuesta, tamaño
- Listener en evento `finish` de respuesta
- **Aplicado:** Globalmente en `main.ts` del gateway

#### 2. Exception Filters

**Ubicación:** `src/gateway/filters/`

- **HttpExceptionFilter:** Maneja `HttpException`, devuelve JSON con success, statusCode, timestamp, path, method, message
- **RpcExceptionFilter:** Maneja `RpcException` de microservicios, mapea errores RPC a HTTP
- Manejo especial para errores de BD: `QueryFailedError` con código `23505` (unique constraint) → 409 Conflict
- **Aplicación:** Global via `APP_FILTER` provider en `gateway.module.ts`

#### 3. Guards Personalizados

**Ubicación:** `src/gateway/guards/`

- **JwtAuthGuard:** Extiende `AuthGuard('jwt')`, permite rutas públicas con `@Public()`, valida token JWT
- **RolesGuard:** Valida roles del usuario contra `@Roles()` decorator
- Usa `Reflector` para leer metadata de decoradores
- **Aplicación:** Global via `APP_GUARD`, todas las rutas requieren auth salvo `@Public()`

#### 4. Interceptores

**Ubicación:** `src/gateway/interceptors/`

- **TransformInterceptor:** Envuelve respuestas en `{ success, data, timestamp }`
- **LoggingInterceptor:** Log de tiempo de respuesta para cada request
- Usa RxJS `pipe`, `map`, `tap` para transformar/observar respuestas
- **Aplicación:** Global via `APP_INTERCEPTOR` en `gateway.module.ts`

---

## ✅ Autenticación JWT con Roles y Permisos

### Estado: ✅ COMPLETADO

#### 1. Módulo de Autenticación

**Ubicación:** `src/gateway/auth/`

- PassportModule con estrategia 'jwt' por defecto
- JwtModule con secret y expiresIn (15m para access token)
- ClientsModule para comunicación con users-service
- Providers: AuthService, JwtStrategy, RefreshTokenStrategy
- Exports: AuthService, JwtStrategy, PassportModule, JwtModule

#### 2. Estrategias JWT

**Ubicación:** `src/gateway/auth/strategies/`

- **JwtStrategy:** Valida access token desde Authorization header (Bearer), extrae payload (sub, email, role)
- **RefreshTokenStrategy:** Valida refresh token desde body, usa JWT_REFRESH_SECRET (7d expiración)
- Ambas extienden `PassportStrategy(Strategy, 'nombre')`
- Método `validate()` retorna objeto user para inyección en request

#### 3. AuthService con JWT y Refresh Token

**Ubicación:** `src/gateway/auth/auth.service.ts`

- **register():** Hash password con bcrypt (10 rounds), crea usuario vía RPC, genera tokens
- **login():** Busca usuario por email vía RPC, valida password con bcrypt.compare, genera tokens
- **refreshToken():** Busca usuario por ID, regenera access + refresh token
- **generateTokens():** Crea payload (sub, email, role), firma accessToken (15m) y refreshToken (7d)
- Comunica con users-service vía ClientProxy inyectado

#### 4. Controlador de Autenticación

**Ubicación:** `src/gateway/auth/auth.controller.ts`

- POST `/auth/register`: Público, body RegisterDto, retorna tokens + user
- POST `/auth/login`: Público, body LoginDto, retorna tokens + user
- POST `/auth/refresh`: Público pero con guard jwt-refresh, body refreshToken, retorna nuevos tokens
- GET `/auth/profile`: Protegido, retorna datos del usuario autenticado
- Usa decoradores `@Public()`, `@CurrentUser()`, `@ApiBearerAuth()`

#### 5. Decoradores Personalizados

**Ubicación:** `src/gateway/decorators/`

- **@Public():** SetMetadata para marcar rutas públicas, bypass JwtAuthGuard
- **@Roles(...roles):** SetMetadata para definir roles permitidos, valida con RolesGuard
- **@CurrentUser(key?):** ParamDecorator para inyectar user desde request, opcionalmente extrae campo específico (userId, email, role)

#### 6. Protección de Rutas

- **Ruta pública:** `@Public()` + endpoint
- **Ruta protegida:** Sin decorator (JwtAuthGuard global), `@ApiBearerAuth()` para Swagger
- **Ruta admin:** `@Roles('admin')` + `@ApiBearerAuth()`
- **Extraer user:** `@CurrentUser()` o `@CurrentUser('userId')` en parámetros
- Por defecto, todas las rutas requieren JWT salvo las marcadas con `@Public()`

#### 7. Roles desde Base de Datos

- User Entity: columna `role` con default 'user', tipo enum ('user' | 'admin')
- Seeders: usuarios con roles asignados (<admin@sportsline.com>/admin123, <user@sportsline.com>/user123)
- Password hasheado con bcrypt en seeder
- Rol incluido en JWT payload para validación sin consulta adicional

#### 8. Flujo de Autenticación

1. **POST /auth/register:** Hash password → RPC create user → Generate tokens
2. **POST /auth/login:** RPC find user → Compare password → Generate tokens
3. **POST /auth/refresh:** Validate refresh token → RPC find user → Generate new tokens
4. **GET /auth/profile:** Validate JWT → RPC find user → Return data
5. **Protected Route:** Request → JwtAuthGuard (valida token) → RolesGuard (valida rol) → Controller

**Respuesta auth:** `{ success, data: { accessToken, refreshToken, user: { id, name, email, role } }, timestamp }`

---

## ⏳ Autenticaciones Avanzadas

### Estado: 🔄 PENDIENTE

#### 1. X-API-Key Authentication

**Estado:** ⏳ PENDIENTE

- Estrategia de API Key con validación contra BD
- Decorador @ApiKey() para endpoints externos
- Guard para validar header x-api-key

#### 2. OAuth2 (Google, GitHub)

**Estado:** ⏳ PENDIENTE

- Integración con @nestjs/passport-google-oauth20
- Estrategia OAuth2 con callback endpoints
- Validación y vinculación con JWT existente

---

## ✅ Pruebas y Análisis Estático

### Estado: 🔄 EN PROGRESO

#### 1. Swagger Documentation

**Estado:** ✅ COMPLETADO

- **Ubicación:** <http://localhost:3000/docs>
- DocumentBuilder: Título, descripción, versión, addBearerAuth para JWT
- DTOs con @ApiProperty, @ApiPropertyOptional (description, example, minLength)
- Endpoints con @ApiOperation, @ApiResponse (status, description)
- @ApiBearerAuth() en rutas protegidas
- Ejemplos de login: <admin@sportsline.com>/admin123, <user@sportsline.com>/user123

#### 2. Tests Unitarios

**Estado:** ✅ COMPLETADO

- **Cobertura:** ~21.55%
- **Estructura:** test/unit/{users,products,orders,categories,orderItems}/*.spec.ts
- Mock de repositorios con getRepositoryToken(Entity)
- Test.createTestingModule para crear contexto
- jest.spyOn para mockear métodos de repositorio
- **Comandos:** `npm test`, `npm run test:watch`, `npm run test:cov`, `npm run test:debug`

#### 3. SonarQube

**Estado:** ⏳ PENDIENTE

- Integración con SonarQube/SonarCloud
- Archivo sonar-project.properties con sources, tests, cobertura
- Análisis de código y métricas de calidad

#### 4. Pre-commit Hooks (Husky)

**Estado:** ⏳ PENDIENTE

- Instalación de Husky + lint-staged
- Hook pre-commit: ESLint + Prettier
- Hook pre-push: Ejecución de tests

---

## 🚀 Cómo Ejecutar el Proyecto

### Requisitos

- Node.js 18+, PostgreSQL 16, Docker & Docker Compose

### Instalación

```bash
git clone <repo-url> && cd sportsline-ecommerce
npm install
cp .env.example .env  # Configurar credenciales
```

### Ejecución Docker (Recomendado)

```bash
npm run docker        # Inicia todos los servicios
npm run seed          # Ejecuta seed.sql
docker-compose logs -f  # Ver logs
```

### Ejecución Local

```bash
docker-compose up -d postgres
npm run seed
npm run start:gateway  # Puerto 3000
# En terminales separadas: start:users, start:products, start:orders, start:categories, start:order-items
```

### Acceso

- Gateway: <http://localhost:3000>
- Swagger: <http://localhost:3000/docs>
- DB: localhost:8326 (puerto externo)

### Tests

```bash
npm test           # Unitarios
npm run test:cov   # Con cobertura
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
