import { setSeederFactory } from 'typeorm-extension';
import { Order, OrderStatus } from '../../order/entities/order.entity';

export const OrderFactory = setSeederFactory(Order, (faker) => {
    const order = new Order();
    order.total = parseFloat(faker.commerce.price());
        order.status = faker.helpers.arrayElement([
            OrderStatus.PENDING,
            OrderStatus.DELIVERED,
            OrderStatus.CANCELLED,
        ]);
    // La relación con Client se manejará en el seeder
    return order;
});
