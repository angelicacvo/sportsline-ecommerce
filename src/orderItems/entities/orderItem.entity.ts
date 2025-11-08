import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Order } from "../../orders/entities/order.entity";
import { Product } from "../../products/entities/product.entity";

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  
  // relations
  @ManyToOne(() => Order , order => order.orderItems)
  order: Order;

  @ManyToOne(() => Product, product => product.orderItems)
  product: Product;
}
