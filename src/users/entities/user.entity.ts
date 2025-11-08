import { PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Entity, Unique } from "typeorm";
import { Exclude } from "class-transformer";
import { Order } from "../../orders/entities/order.entity";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Exclude()
  @Column({ select: false, type: 'text' })
  password: string;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role: 'user' | 'admin';

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // relations
  @OneToMany(() => Order, order => order.user)
  orders: Order[];
}
