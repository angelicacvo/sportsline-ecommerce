import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Client } from '../clients/client.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  // 👤 Relación: cada pedido pertenece a un cliente
  @ManyToOne(() => Client, (client) => client.orders, { eager: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  // 📦 Relación: cada pedido pertenece a un producto
  @ManyToOne(() => Product, (product) => product.orders, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // 👨‍💻 Relación: pedido creado por un usuario (admin o vendedor)
  @ManyToOne(() => User, (user) => user.orders, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 🔢 Cantidad del producto pedido
  @Column()
  quantity: number;

  // 💰 Total del pedido
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  // 🕒 Fecha de creación del pedido
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
