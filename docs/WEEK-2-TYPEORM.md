# Week 2: TypeORM & Database

## 🎯 Objetivo
Crear entidades, relaciones, migraciones y seeders con TypeORM.

---

## 📦 Paso 1: Instalar Dependencias

```bash
npm install @nestjs/typeorm typeorm pg
npm install --save-dev @types/node
```

---

## 🗄️ Paso 2: Crear Entidades

### Entity: User

Crear `src/user/entities/user.entity.ts`:

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Role } from '../../role/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  username: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true, default: 'local' })
  provider: string;

  @ManyToOne(() => Role, role => role.users)
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Entity: Role

Crear `src/role/entities/role.entity.ts`:

```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Permission } from '../../permission/entities/permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => User, user => user.role)
  users: User[];

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
  permissions: Permission[];
}
```

### Entity: Permission

Crear `src/permission/entities/permission.entity.ts`:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ nullable: true })
  description: string;
}
```

### Entity: Product

Crear `src/product/entities/product.entity.ts`:

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Entity: Client

Crear `src/client/entities/client.entity.ts`:

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from '../../order/entities/order.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column('text', { nullable: true })
  address: string;

  @OneToMany(() => Order, order => order.client)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Entity: Order

Crear `src/order/entities/order.entity.ts`:

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, client => client.orders)
  client: Client;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ default: 'pending' })
  status: string;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Entity: OrderItem

Crear `src/order-items/entities/order-item.entity.ts`:

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.items)
  order: Order;

  @ManyToOne(() => Product)
  product: Product;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}
```

---

## 🔄 Paso 3: Crear Migraciones

```bash
# Generar migración automática
npm run typeorm migration:generate -- src/database/migrations/InitialSchema -d src/database/data-source.ts

# Ejecutar migraciones
npm run typeorm:run

# Revertir última migración (si hay error)
npm run typeorm:revert
```

---

## 🌱 Paso 4: Crear Seeders

### Main Seeder

Crear `src/database/seed.ts`:

```typescript
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import dataSource from './data-source';
import { seedRoles } from './seeds/role.seeder';
import { seedPermissions } from './seeds/permission.seeder';
import { seedUsers } from './seeds/user.seeder';

config();

async function runSeeders() {
  try {
    await dataSource.initialize();
    console.log('✅ Data Source initialized');

    await seedPermissions(dataSource);
    await seedRoles(dataSource);
    await seedUsers(dataSource);

    console.log('✅ All seeders completed');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeders();
```

### Permission Seeder

Crear `src/database/seeds/permission.seeder.ts`:

```typescript
import { DataSource } from 'typeorm';
import { Permission } from '../../permission/entities/permission.entity';

export async function seedPermissions(dataSource: DataSource): Promise<void> {
  const permissionRepo = dataSource.getRepository(Permission);

  const permissions = [
    { name: 'users.read', description: 'Read users' },
    { name: 'users.create', description: 'Create users' },
    { name: 'users.update', description: 'Update users' },
    { name: 'users.delete', description: 'Delete users' },
    { name: 'products.read', description: 'Read products' },
    { name: 'products.create', description: 'Create products' },
    { name: 'products.update', description: 'Update products' },
    { name: 'products.delete', description: 'Delete products' },
  ];

  for (const perm of permissions) {
    const exists = await permissionRepo.findOne({ where: { name: perm.name } });
    if (!exists) {
      await permissionRepo.save(perm);
      console.log(`✅ Permission created: ${perm.name}`);
    }
  }
}
```

### Role Seeder

Crear `src/database/seeds/role.seeder.ts`:

```typescript
import { DataSource } from 'typeorm';
import { Role } from '../../role/entities/role.entity';
import { Permission } from '../../permission/entities/permission.entity';

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const roleRepo = dataSource.getRepository(Role);
  const permissionRepo = dataSource.getRepository(Permission);

  // Admin role with all permissions
  let adminRole = await roleRepo.findOne({ where: { name: 'admin' } });
  if (!adminRole) {
    const allPermissions = await permissionRepo.find();
    adminRole = roleRepo.create({
      name: 'admin',
      description: 'Administrator with full access',
      permissions: allPermissions,
    });
    await roleRepo.save(adminRole);
    console.log('✅ Admin role created');
  }

  // Customer role with limited permissions
  let customerRole = await roleRepo.findOne({ where: { name: 'customer' } });
  if (!customerRole) {
    const readPermissions = await permissionRepo.find({
      where: { name: 'products.read' },
    });
    customerRole = roleRepo.create({
      name: 'customer',
      description: 'Regular customer',
      permissions: readPermissions,
    });
    await roleRepo.save(customerRole);
    console.log('✅ Customer role created');
  }
}
```

### User Seeder

Crear `src/database/seeds/user.seeder.ts`:

```typescript
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../role/entities/role.entity';

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  const adminRole = await roleRepo.findOne({ where: { name: 'admin' } });
  const customerRole = await roleRepo.findOne({ where: { name: 'customer' } });

  // Admin user
  const adminExists = await userRepo.findOne({ where: { email: 'admin@example.com' } });
  if (!adminExists && adminRole) {
    await userRepo.save({
      username: 'admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      role: adminRole,
    });
    console.log('✅ Admin user created');
  }

  // Customer user
  const customerExists = await userRepo.findOne({ where: { email: 'customer@example.com' } });
  if (!customerExists && customerRole) {
    await userRepo.save({
      username: 'customer',
      email: 'customer@example.com',
      password: await bcrypt.hash('customer123', 10),
      role: customerRole,
    });
    console.log('✅ Customer user created');
  }
}
```

---

## ▶️ Paso 5: Ejecutar Seeders

```bash
npm run seed
```

Deberías ver:
```
✅ Data Source initialized
✅ Permission created: users.read
✅ Permission created: users.create
...
✅ Admin role created
✅ Customer role created
✅ Admin user created
✅ Customer user created
✅ All seeders completed
```

---

## ✅ Checklist Week 2

- [ ] Todas las entidades creadas
- [ ] Relaciones configuradas (OneToMany, ManyToOne, ManyToMany)
- [ ] Migraciones generadas y ejecutadas
- [ ] Seeders creados
- [ ] Base de datos poblada con datos iniciales
- [ ] Usuarios de prueba creados (admin y customer)

---

## 🚀 Siguiente Paso

**[Week 3: Modules & DTOs →](./WEEK-3-MODULES.md)**
