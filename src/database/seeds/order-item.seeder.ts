import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { Order } from '../../order/entities/order.entity';
import { Product } from '../../product/entities/product.entity';

export default class OrderItemSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<void> {
        await dataSource.query('TRUNCATE TABLE "order_items" RESTART IDENTITY CASCADE;');

        const orderItemFactory = await factoryManager.get(OrderItem);
        const orderRepository = dataSource.getRepository(Order);
        const productRepository = dataSource.getRepository(Product);

        const orders = await orderRepository.find();
        const products = await productRepository.find();

        if (orders.length > 0 && products.length > 0) {
            const items: OrderItem[] = [];
            for (const order of orders) {
                const numItems = Math.floor(Math.random() * 5) + 1;
                for (let i = 0; i < numItems; i++) {
                    const product = products[Math.floor(Math.random() * products.length)];
                    const item = await orderItemFactory.make({
                        order: order,
                        product: product,
                        price: product.price, // Usar el precio del producto
                    });
                    items.push(item);
                }
            }
            await dataSource.getRepository(OrderItem).save(items);
        }
    }
}
