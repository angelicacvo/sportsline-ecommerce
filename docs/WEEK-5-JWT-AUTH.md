# Week 5: JWT Authentication, Roles & Permissions

## 🎯 Objetivo
Implementar autenticación con JWT + Refresh Token, roles y permisos desde base de datos.

---

## 📦 Paso 1: Instalar Dependencias

```bash
npm install @nestjs/passport passport @nestjs/jwt passport-jwt
npm install bcrypt
npm install --save-dev @types/passport-jwt @types/bcrypt
```

---

## 🔐 Paso 2: Crear Auth Module y Service

```bash
nest g module auth
nest g service auth
nest g controller auth
```

`src/auth/auth.service.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(username: string, email: string, password: string, role?: string) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const newUser = await this.userService.create({ username, email, password, role });
    
    const payload = { 
      sub: newUser.id, 
      email: newUser.email, 
      role: newUser.role.name
    };
    
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '1h' });
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
    
    return { accessToken, refreshToken };
  }

  async signIn(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isValidPassword = await bcrypt.compare(pass, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role.name
    };

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '1h' });
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
    
    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET
      });
      const newPayload = { sub: payload.sub, email: payload.email, role: payload.role };
      const accessToken = await this.jwtService.signAsync(newPayload, { expiresIn: '1h' });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
```

---

## 🎮 Paso 3: Crear Auth Controller

`src/auth/auth.controller.ts`:

```typescript
import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() body: { username: string; email: string; password: string; role?: string }) {
    return this.authService.register(body.username, body.email, body.password, body.role);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.signIn(body.email, body.password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshAccessToken(body.refreshToken);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return req.user;
  }
}
```

---

## 📦 Paso 4: Configurar Auth Module

`src/auth/auth.module.ts`:

```typescript
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, RolesGuard],
  exports: [AuthGuard, RolesGuard],
})
export class AuthModule {}
```

---

## 🔑 Paso 5: Crear DTOs de Auth

`src/auth/dto/login.dto.ts`:

```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string;
}
```

`src/auth/dto/register.dto.ts`:

```typescript
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'customer', required: false })
  @IsOptional()
  @IsString()
  role?: string;
}
```

---

## 🧪 Paso 6: Probar Autenticación

### 1. Registrar usuario

```bash
POST http://localhost:3003/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "test123",
  "role": "customer"
}
```

Respuesta:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

```bash
POST http://localhost:3003/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### 3. Usar token en peticiones protegidas

```bash
GET http://localhost:3003/user
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Refresh token

```bash
POST http://localhost:3003/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👥 Paso 7: Implementar Sistema de Permisos

`src/role/role.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}

  async findByName(name: string): Promise<Role> {
    return this.roleRepo.findOne({ 
      where: { name },
      relations: ['permissions']
    });
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepo.find({ relations: ['permissions'] });
  }
}
```

---

## ✅ Checklist Week 5

- [ ] JWT Module configurado
- [ ] Auth Service con register/login/refresh
- [ ] Auth Controller con endpoints
- [ ] Auth Guard implementado
- [ ] Roles Guard funcionando
- [ ] DTOs de autenticación
- [ ] Refresh token implementado
- [ ] Roles y permisos desde BD
- [ ] Protección de rutas con guards

---

## 🔐 Usuarios de Prueba

Después de ejecutar seeders:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | admin |
| customer@example.com | customer123 | customer |

---

## 🚀 Siguiente Paso

**[Week 6: Advanced Auth →](./WEEK-6-ADVANCED-AUTH.md)** (Ya existente)
