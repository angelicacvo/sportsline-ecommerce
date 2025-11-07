import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { Client } from '../../client/entities/client.entity';

export default class OrderSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<void> {
        await dataSource.query('TRUNCATE TABLE "orders" RESTART IDENTITY CASCADE;');

        const orderFactory = await factoryManager.get(Order);
        const clientRepository = dataSource.getRepository(Client);
        const clients = await clientRepository.find();

        if (clients.length > 0) {
            const orders: Order[] = [];
            for (let i = 0; i < 15; i++) {
                const order = await orderFactory.make({
                    client: clients[Math.floor(Math.random() * clients.length)],
                });
                orders.push(order);
            }
            await dataSource.getRepository(Order).save(orders);
        }
    }
}
