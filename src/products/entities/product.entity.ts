import { Category } from "../../categories/entities/category.entity";
import { OrderItem } from "../../orderItems/entities/orderItem.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ unique: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // relations
  @ManyToOne(() => Category, category => category.products)
  category: Category;

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  orderItems: OrderItem[];
}
