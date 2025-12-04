# 📚 Guía Completa - Sportsline E-commerce con NestJS

Esta es tu guía paso a paso para crear un e-commerce completo con NestJS desde cero.

## 🗺️ Índice de la Guía

**Lee los documentos en este orden:**

1. **[Week 1: Setup Inicial](./WEEK-1-SETUP.md)** ← Empieza aquí
2. **[Week 2: TypeORM & Base de Datos](./WEEK-2-TYPEORM.md)**
3. **[Week 3: Módulos y DTOs](./WEEK-3-MODULES.md)**
4. **[Week 4: Middleware y Guards](./WEEK-4-MIDDLEWARE.md)**
5. **[Week 5: Autenticación JWT](./WEEK-5-JWT-AUTH.md)**
6. **[Week 6: Autenticación Avanzada](./WEEK-6-ADVANCED-AUTH.md)**
7. **[Week 7: Swagger y Documentación](./WEEK-7-SWAGGER-GUIDE.md)**

**Guías complementarias:**

- **[🐳 Docker](./DOCKER-GUIDE.md)** - Containerización
- **[🧪 Testing](./TESTING-GUIDE.md)** - Pruebas
- **[🚀 Deployment](./DEPLOYMENT-GUIDE.md)** - Despliegue a Hetzner

---

## ⚡ Quick Start (5 minutos)

```bash
# 1. Instalar NestJS CLI
npm install -g @nestjs/cli

# 2. Crear proyecto
nest new sportsline-ecommerce
cd sportsline-ecommerce

# 3. Instalar dependencias principales
npm install @nestjs/typeorm typeorm pg @nestjs/config
npm install @nestjs/passport passport passport-jwt @nestjs/jwt
npm install class-validator class-transformer
npm install bcrypt

# 4. Configurar .env
cp .env.example .env

# 5. Iniciar servidor
npm run start:dev
```

---

## 📦 Dependencias del Proyecto

### Dependencias de Producción

```bash
# Core NestJS
npm install @nestjs/common@11.0.1 @nestjs/core@11.0.1 @nestjs/platform-express@11.0.1

# Database & ORM
npm install @nestjs/typeorm@10.0.2 typeorm@0.3.20 pg@8.13.1

# Configuration
npm install @nestjs/config@3.3.0

# Validation
npm install class-validator@0.14.1 class-transformer@0.5.1

# Authentication
npm install @nestjs/passport@10.0.3 passport@0.7.0
npm install @nestjs/jwt@10.2.0 passport-jwt@4.0.1
npm install bcrypt@5.1.1

# Google OAuth (opcional)
npm install passport-google-oauth20@2.0.0

# Documentation
npm install @nestjs/swagger@8.0.1
```

### Dependencias de Desarrollo

```bash
npm install --save-dev @nestjs/cli@11.0.0 @nestjs/schematics@11.0.0
npm install --save-dev @nestjs/testing@11.0.1
npm install --save-dev @types/node@22.10.1 @types/express@5.0.0
npm install --save-dev @types/bcrypt@5.0.2 @types/passport-jwt@4.0.1
npm install --save-dev typescript@5.7.2 ts-node@10.9.2
npm install --save-dev eslint@9.16.0 prettier@3.4.2
npm install --save-dev jest@29.7.0 @types/jest@29.5.14
```

---

## 🏗️ Arquitectura del Proyecto

```
src/
├── main.ts                    # Entry point, Swagger setup
├── app.module.ts              # Root module
│
├── database/                  # Database configuration
│   ├── data-source.ts        # TypeORM config
│   ├── database.module.ts    # Database module
│   ├── seeds/                # Database seeders
│   └── factories/            # Data factories
│
├── user/                      # User module
│   ├── entities/
│   │   └── user.entity.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── user.controller.ts
│   ├── user.service.ts
│   └── user.module.ts
│
├── auth/                      # Authentication
│   ├── guards/
│   │   ├── auth.guard.ts     # JWT guard
│   │   ├── roles.guard.ts    # Roles guard
│   │   └── api-key.guard.ts  # API key guard
│   ├── strategies/
│   │   └── google.strategy.ts # OAuth strategy
│   ├── decorators/
│   │   └── roles.decorator.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
│
├── role/                      # Roles from database
├── permission/                # Permissions from database
├── api-key/                   # API key management
├── product/                   # Product CRUD
├── client/                    # Client CRUD
├── order/                     # Order management
└── order-items/               # Order items
```

---

## 🎯 Conceptos Clave de NestJS

### 1. Modules (Módulos)
Agrupan funcionalidades relacionadas. Cada feature tiene su módulo.

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

### 2. Controllers (Controladores)
Manejan las peticiones HTTP y respuestas.

```typescript
@Controller('users')
export class UserController {
  @Get()
  findAll() { }
  
  @Post()
  create(@Body() dto: CreateUserDto) { }
}
```

### 3. Services (Servicios)
Contienen la lógica de negocio.

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}
  
  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }
}
```

### 4. Entities (Entidades)
Representan tablas de la base de datos.

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  email: string;
}
```

### 5. DTOs (Data Transfer Objects)
Definen y validan la estructura de datos.

```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;
  
  @IsString()
  @MinLength(6)
  password: string;
}
```

---

## 🔄 Flujo de una Petición HTTP

```
1. Cliente hace request → POST /users
2. NestJS enruta a UserController.create()
3. ValidationPipe valida el DTO
4. Guards verifican autenticación/permisos
5. Controller llama a UserService.create()
6. Service usa Repository para guardar en BD
7. TypeORM ejecuta INSERT en PostgreSQL
8. BD devuelve el usuario creado
9. Service devuelve resultado al Controller
10. Controller devuelve JSON al cliente
```

---

## 📝 Variables de Entorno Necesarias

Crea `.env` con estas variables:

```env
# Server
PORT=3003
NODE_ENV=development

# Database (Supabase o PostgreSQL local)
DB_HOST=aws-1-us-east-2.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.xxxxx
DB_PASSWORD=your_password
DB_NAME=postgres

# JWT
JWT_SECRET=your-super-secret-key

# API Key
API_KEY=your-api-key-for-external-services

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3003/auth/google/callback
```

---

## 🚀 Comandos Esenciales

```bash
# Generar recursos
nest g module users           # Generar módulo
nest g controller users       # Generar controlador
nest g service users          # Generar servicio
nest g resource users         # Generar todo (module, controller, service, entity, dto)

# Base de datos
npm run typeorm migration:generate -- src/database/migrations/InitialMigration
npm run typeorm migration:run
npm run seed

# Desarrollo
npm run start:dev             # Modo desarrollo (hot reload)
npm run build                 # Build producción
npm run start:prod            # Ejecutar build

# Testing
npm run test                  # Unit tests
npm run test:e2e              # E2E tests
npm run test:cov              # Coverage

# Linting
npm run lint                  # Verificar código
npm run format                # Formatear código
```

---

## ✅ Checklist del Proyecto

### Week 1: Setup
- [ ] NestJS CLI instalado
- [ ] Proyecto creado
- [ ] TypeScript configurado
- [ ] ESLint y Prettier configurados
- [ ] Variables de entorno (.env)

### Week 2: Database
- [ ] TypeORM instalado
- [ ] Conexión a PostgreSQL
- [ ] Entidades creadas
- [ ] Migraciones funcionando
- [ ] Seeders ejecutados

### Week 3: Modules
- [ ] Módulos generados (User, Product, Client, Order)
- [ ] DTOs con validación
- [ ] CRUD completo en cada módulo

### Week 4: Middleware
- [ ] Middleware de logging
- [ ] Exception filters
- [ ] Guards de autenticación
- [ ] Interceptors

### Week 5: JWT
- [ ] Autenticación JWT
- [ ] Refresh tokens
- [ ] Roles desde BD
- [ ] Permisos desde BD

### Week 6: Advanced Auth
- [ ] X-API-KEY authentication
- [ ] Google OAuth2
- [ ] Permisos por API key

### Week 7: Docs & Quality
- [ ] Swagger completo
- [ ] Tests unitarios
- [ ] Tests E2E
- [ ] SonarQube (opcional)

---

## 🆘 Problemas Comunes

### Error: Cannot connect to database
**Solución:** Verifica credenciales en `.env` y que PostgreSQL esté corriendo.

### Error: Module not found
**Solución:** `npm install` y reinicia el servidor.

### Error: Port already in use
**Solución:** Mata el proceso o cambia el PORT en `.env`.

### Error: JWT must be provided
**Solución:** Envía el token en header: `Authorization: Bearer <token>`.

---

## 📚 Recursos Adicionales

- **Documentación oficial:** https://docs.nestjs.com
- **TypeORM Docs:** https://typeorm.io
- **Passport.js:** http://www.passportjs.org
- **Class Validator:** https://github.com/typestack/class-validator

---

**¡Ahora ve a [Week 1: Setup](./WEEK-1-SETUP.md) para empezar!** 🚀
