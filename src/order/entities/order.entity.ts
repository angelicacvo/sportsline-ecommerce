import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Client } from "../../client/entities/client.entity";
import { OrderItem } from "../../order-items/entities/order-item.entity";

export enum OrderStatus {
    PENDING = 'pending',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    total: number;

    @Column({
        type: 'enum',
        enum: OrderStatus
    })
    status: OrderStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Client, client => client.orders)
    client: Client;

    @OneToMany(() => OrderItem, item => item.order, { cascade: true })
    items: OrderItem[];
}
