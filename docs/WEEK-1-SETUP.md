# Week 1: Setup Inicial de NestJS

## 🎯 Objetivo
Crear el proyecto base de NestJS con TypeScript, configurar entorno y conectar a PostgreSQL.

---

## 📦 Paso 1: Instalar Node.js y NestJS CLI

```bash
# Verificar Node.js (debe ser v20+)
node --version

# Instalar NestJS CLI globalmente
npm install -g @nestjs/cli

# Verificar instalación
nest --version
```

---

## 🚀 Paso 2: Crear Proyecto

```bash
# Crear proyecto
nest new sportsline-ecommerce

# Seleccionar npm como package manager
# Esperar a que instale dependencias

cd sportsline-ecommerce
```

Esto crea:
```
sportsline-ecommerce/
├── src/
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
├── node_modules/
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## ⚙️ Paso 3: Configurar Variables de Entorno

```bash
# Instalar dependencia
npm install @nestjs/config
```

Crear `.env` en la raíz:

```env
PORT=3003
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=sportsline_db

JWT_SECRET=my-super-secret-key-change-this
API_KEY=your-api-key-here
```

Crear `.env.example` (sin valores sensibles):

```env
PORT=3003
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
API_KEY=
```

Actualizar `.gitignore`:

```
node_modules/
dist/
.env           # ← Importante: nunca subir .env a Git
```

---

## 📝 Paso 4: Configurar ConfigModule

Editar `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Hace .env disponible en toda la app
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## 🔧 Paso 5: Configurar Puerto y Validación

Editar `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,  // Elimina propiedades no definidas en DTO
      forbidNonWhitelisted: true,  // Lanza error si hay propiedades extras
      transform: true,  // Transforma payloads a instancias de DTO
    }),
  );

  // Puerto desde .env
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
```

---

## 🐘 Paso 6: Instalar TypeORM y PostgreSQL

```bash
npm install @nestjs/typeorm typeorm pg
```

---

## 🗄️ Paso 7: Configurar Base de Datos

Crear `src/database/data-source.ts`:

```typescript
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,  // ¡NUNCA true en producción!
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
```

Crear `src/database/database.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
```

Importar en `app.module.ts`:

```typescript
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,  // ← Agregar aquí
  ],
  // ...
})
export class AppModule {}
```

---

## ✅ Paso 8: Verificar Setup

```bash
# Iniciar servidor
npm run start:dev

# Debería ver:
# [Nest] LOG [NestFactory] Starting Nest application...
# [Nest] LOG [InstanceLoader] AppModule dependencies initialized
# [Nest] LOG [NestApplication] Nest application successfully started
# 🚀 Server running on http://localhost:3003
```

Abrir navegador en `http://localhost:3003` → Debe mostrar "Hello World!"

---

## 🎨 Paso 9: Configurar ESLint y Prettier

Ya vienen configurados, pero verifica:

`.eslintrc.js`:
```javascript
module.exports = {
  parser: '@typescript/eslint-parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

`.prettierrc`:
```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

Comandos:
```bash
npm run lint       # Revisar código
npm run format     # Formatear código
```

---

## 📦 Paso 10: Scripts útiles en package.json

Agregar estos scripts:

```json
{
  "scripts": {
    "start:dev": "nest start --watch",
    "build": "nest build",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli",
    "typeorm:run": "npm run typeorm migration:run -- -d src/database/data-source.ts",
    "typeorm:revert": "npm run typeorm migration:revert -- -d src/database/data-source.ts",
    "seed": "ts-node -r tsconfig-paths/register src/database/seed.ts"
  }
}
```

---

## ✅ Checklist Week 1

- [ ] Node.js 20+ instalado
- [ ] NestJS CLI instalado (`nest --version`)
- [ ] Proyecto creado (`nest new`)
- [ ] ConfigModule configurado
- [ ] Variables de entorno (.env) creadas
- [ ] TypeORM y PostgreSQL instalados
- [ ] Conexión a base de datos configurada
- [ ] Servidor corriendo en puerto 3003
- [ ] ESLint y Prettier funcionando

---

## 🚀 Siguiente Paso

**[Week 2: TypeORM & Database →](./WEEK-2-TYPEORM.md)**
