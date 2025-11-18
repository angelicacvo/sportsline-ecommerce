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

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;
  
@Column({ nullable: true })
refreshToken: string;

  @Column({ nullable: true })
  hashedRefreshToken?: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
