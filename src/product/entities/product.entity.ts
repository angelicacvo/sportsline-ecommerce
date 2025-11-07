import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, OneToMany, ManyToOne } from "typeorm";
import { OrderItem } from "../../order-items/entities/order-item.entity";
import { User } from "../../user/entities/user.entity";

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ unique: true })
    code: string

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column()
    stock: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => OrderItem, item => item.product)
    orderItems: OrderItem[];

    @ManyToOne(() => User, user => user.products, { nullable: true })
    seller?: User;
}
