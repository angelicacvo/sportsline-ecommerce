import { setSeederFactory } from 'typeorm-extension';
import { Order } from '../../order/entities/order.entity';

export const OrderFactory = setSeederFactory(Order, (faker) => {
    const order = new Order();
    order.total = parseFloat(faker.commerce.price());
    order.status = faker.helpers.arrayElement(['pending', 'completed', 'cancelled']);
    // La relación con Client se manejará en el seeder
    return order;
});
