import { OrderItem } from "../../orderItems/entities/orderItem.entity";
import { User } from "../../users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'text' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // relations
  @ManyToOne(() => User, user => user.orders)
  user: User;

  @OneToMany(() => OrderItem, (orderItem: OrderItem) => orderItem.order, { cascade: true })
  orderItems: OrderItem[];
}
