import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from 'src/orders/order.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string | null;

  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  hashedRefreshToken?: string;

  @Column({ nullable: true })
  provider?: string;

  @Column({ nullable: true })
  providerId?: string;

  @Column({ nullable: true })
  avatar?: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
