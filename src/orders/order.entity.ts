import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/product.entity';
import { Client } from 'src/clients/client.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @ManyToOne(() => Product, (product) => product.orders)
  product: Product;

  @ManyToOne(() => Client, (client) => client.orders)
  client: Client;

  @Column('int')
  quantity: number;

  @Column('decimal')
  total: number;
}
